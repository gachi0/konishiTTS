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
    engineUrl: "http://127.0.0.1:50021"
};

export let voicevox = axios.create();

export const botInit = async () => {
    config = toml.parse(fs.readFileSync("./config.toml").toString());
    voicevox = axios.create({ baseURL: config.engineUrl });
    const speakers = await voicevox.get("/speakers");
    for (const i of speakers.data) {
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

        // モーラ数が guild.maxChar を超えていたらスキップ
        let moras = 0;
        for (const i of query.data.accent_phrases) {
            moras += i.moras.length;
            moras += i.pause_mora ? 1 : 0;
        }
        if (guild.maxChar < moras) return;

        // その他の設定を反映
        query.data.speedScale = guild.speed;
        query.data.pitchScale = user?.pitch ?? guild.pitch;

        //音声合成
        const wav = await voicevox.post(`/synthesis?speaker=${0}`, query.data, {
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