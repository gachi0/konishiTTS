import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, Intents, TextBasedChannels } from "discord.js";
import fs from "fs";
import toml from "toml";
import { AudioPlayerStatus, AudioResource, createAudioPlayer, entersState, VoiceConnection } from "@discordjs/voice";

export const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES]
});

export class TTSManager {
    private player = createAudioPlayer();
    /** 読み上げるテキストチャンネルのid */
    chId: string;
    /** Botの接続 */
    conn: VoiceConnection;
    /** 読み上げ待ちの音声たち */
    queue: AudioResource[] = [];
    /** 読み上げ中かどうか */
    isPlaying = false;

    play = async () => {
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

    constructor(chId: string, conn: VoiceConnection) {
        this.chId = chId;
        this.conn = conn;
    }
}

/** 読み上げするギルド */
export const managers: Record<string, TTSManager> = {};

/** 設定 */
export const config: {
    token: string,
    guildId: string,
    engineUrl: string
} = toml.parse(fs.readFileSync("./config.toml").toString());

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