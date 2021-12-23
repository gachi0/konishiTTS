import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, Intents, TextBasedChannels } from "discord.js";
import fs from "fs";
import axios from "axios";
import toml from "toml";
import { AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, VoiceConnection } from "@discordjs/voice";
import { GuildEntity, UserEntity } from "./db";
import { Readable } from "typeorm/platform/PlatformTools";

export const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES]
});


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
    private start = async () => {
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
    };

    /** queueに音声を追加する。再生中でなければ再生を開始する */
    play = async (resource: AudioResource) => {
        this.queue.push(resource);
        if (!this.isPlaying) {
            await this.start();
        }
    };

    /** textを読み上げる */
    speak = async (text: string, guild: GuildEntity, user?: UserEntity) => {
        // 音声合成用のクエリを生成
        const query = await axios.post(
            `${config.engineUrl}/audio_query?text=${encodeURI(text)}&speaker=${user?.speaker ?? guild.speaker}`);

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
        const wav = await axios.post(`${config.engineUrl}/synthesis?speaker=${0}`, query.data, {
            responseType: "arraybuffer"
        });
        const resource = createAudioResource(Readable.from(wav.data));
        await this.play(resource);
    };

    constructor(chId: string, conn: VoiceConnection) {
        this.conn = conn;
        this.chId = chId;
    }
}

/** 読み上げするギルド */
export const managers: Record<string, ConnectionManager | undefined> = {};

/** 設定 */
export const config: {
    token: string,
    guildId: string,
    engineUrl: string
} = toml.parse(fs.readFileSync("./config.toml").toString());

/** スピーカーの情報 */
export const speakersInfo: Record<number, string> = {
    0: "四国めたん(あまあま)",
    2: "四国めたん(ノーマル)",
    4: "四国めたん(セクシー)",
    6: "四国めたん(ツンツン)",
    1: "ずんだもん(あまあま)",
    3: "ずんだもん(ノーマル)",
    5: "ずんだもん(セクシー)",
    7: "ずんだもん(ツンツン)",
    8: "春日部つむぎ",
    9: "波音リツ"
};

/** path 以下の ts | js ファイルの default を全部インポート */
export const allImport = (path: string): Promise<unknown[]> => Promise.all(fs.readdirSync(`./src/${path}`)
    .filter((f: string) => /(\.js|\.ts)$/.test(f))
    .map(async (f: string) => (await import(`./${path}/${f.slice(0, -3)}`)).default));

export interface ICommand {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    adminOnly?: boolean;
    guildOnly?: boolean;
    execute(intr: CommandInteraction, ch?: TextBasedChannels): Promise<void>;
}

export interface IEvent {
    name: string;
    once?: boolean;
    execute(...args: unknown[]): Promise<void>;
}