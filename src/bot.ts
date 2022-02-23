import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { Client, ClientEvents, CommandInteraction, Intents, TextBasedChannel } from "discord.js";
import fs from "fs";
import axios from "axios";
import toml from "toml";
import { AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, VoiceConnection } from "@discordjs/voice";
import { GuildEntity, UserEntity } from "./db";
import { Readable } from "stream";

export const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES]
});

/** 設定 */
export let config = {
    token: "",
    guildId: "",
    readMaxCharLimit: 0,
    readMaxCharDefault: 0,
    engineUrl: "http://127.0.0.1:50021"
};

let voicevox = axios.create({ baseURL: config.engineUrl });

/** 省略時に追加される音声のクエリ */
export let skipStrQuery: unknown[] = [];

export const botInit = async () => {
    // 設定ファイル読み込み
    config = toml.parse(fs.readFileSync("./config.toml").toString());
    // AxiosInstanceを作る
    voicevox = axios.create({ baseURL: config.engineUrl });
    // 省略時に追加される音声のクエリを生成
    skipStrQuery = (await voicevox.post(
        `/audio_query?text=${encodeURI("以下略")}&speaker=0`))
        .data.accent_phrases;
    // スピーカー一覧のデータを取得
    for (const i of (await voicevox.get("/speakers")).data) {
        for (const j of i.styles) {
            speakersInfo.set(j.id, `${i.name}(${j.name})`);
        }
    }
};

/** 読み上げするギルド */
export const managers = new Map<string, ConnectionManager>();

/** スピーカーの情報 */
export const speakersInfo = new Map<number, string>();

export class ConnectionManager {
    private player = createAudioPlayer();
    /** 再生待ちの音声たち */
    private queue: AudioResource[] = [];
    /** 読み上げるチャンネルのid */
    chId;
    /** Botの接続 */
    conn;
    /** 再生中かどうか */
    private isPlaying = false;

    /** 再生開始 */
    private async start() {
        this.isPlaying = true;
        // queueが空になるまで読み上げる
        while (this.queue[0]) {
            // queueの先頭の音声を再生
            this.player.play(this.queue[0]);
            this.conn.subscribe(this.player);
            // 再生が終了するまで待機
            await entersState(this.player, AudioPlayerStatus.Idle, 100000);
            // 再生済の音声を削除
            this.queue.shift();
        }
        this.isPlaying = false;
    }

    /** queueに音声を追加する。再生中でなければ再生を開始する */
    async play(resource: AudioResource) {
        this.queue.push(resource);
        if (!this.isPlaying) {
            await this.start();
        }
    }

    /** 現在読み上げ中の音声をスキップする */
    skip(count = 1) {
        if (count < 1) {
            return;
        }
        if (2 <= count) {
            this.queue = this.queue.slice(count - 1);
        }
        this.player.stop();
    }

    /** textを読み上げる */
    async speak(text: string, guild: GuildEntity, user?: UserEntity) {
        // 音声合成用のクエリを生成
        const query = await voicevox.post(
            `/audio_query?text=${encodeURIComponent(text)}&speaker=${user?.speaker ?? guild.speaker}`);

        let cnt = 0;
        const resultPhrases = [];
        for (const phrase of query.data.accent_phrases) {
            const resultPhrase = { ...phrase, moras: [] };
            for (const mora of phrase.moras) {
                resultPhrase.moras.push(mora);
                cnt++;
                // モーラ数がguild.maxCharを超えていたら止める
                if (guild.maxChar < cnt) {
                    resultPhrases.push(resultPhrase);
                    resultPhrases.push(...skipStrQuery);
                    break;
                }
            }
            cnt += phrase.pause_mora ? 1 : 0;
            if (guild.maxChar < cnt) break;
            // 超えていなければ現在のphraseを追加する
            resultPhrases.push(resultPhrase);
        }
        query.data.accent_phrases = resultPhrases;

        // その他の設定を反映
        query.data.speedScale = guild.speed;

        //音声合成
        const wav = await voicevox.post("/synthesis?speaker=0", query.data, {
            responseType: "arraybuffer"
        });
        const resource = createAudioResource(Readable.from(wav.data));
        await this.play(resource);
    }

    constructor(chId: string, conn: VoiceConnection) {
        this.conn = conn;
        this.chId = chId;
    }
}

export interface ICommand {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    adminOnly?: boolean;
    guildOnly?: boolean;
    execute(intr: CommandInteraction, ch?: TextBasedChannel): Promise<void>;
}

/** listenerの例外をcatchしてイベント登録 */
export const clienton = <K extends keyof ClientEvents>(
    name: K,
    listener: (...args: ClientEvents[K]) => Promise<void>,
    once = false
) => {
    client[once ? "once" : "on"](name, (...args) =>
        listener(...args).catch(console.error));
};