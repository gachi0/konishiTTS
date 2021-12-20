import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, Intents, TextBasedChannels } from "discord.js";
import fs from "fs";
import toml from "toml";
import { AudioPlayerStatus, AudioResource, createAudioPlayer, entersState, VoiceConnection } from "@discordjs/voice";

export const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES]
});

export class ConnectionManager {
    private player = createAudioPlayer();
    /** 読み上げ待ちの音声たち */
    queue: AudioResource[] = [];
    /** 読み上げるテキストチャンネルのid */
    chId: string;
    /** Botの接続 */
    conn: VoiceConnection;
    /** 読み上げ中かどうか */
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

    constructor(chId: string, conn: VoiceConnection) {
        this.chId = chId;
        this.conn = conn;
    }
}

/** 読み上げするギルド */
export const managers: Record<string, ConnectionManager> = {};

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