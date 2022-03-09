import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { Client, ClientEvents, CommandInteraction, Intents, TextBasedChannel } from "discord.js";
import fs from "fs";
import axios from "axios";
import toml from "toml";
import { spawn } from "child_process";
import ConnectionManager from "./connectionManager";

const engineSetUp = async () => {
    try {
        // 省略時に追加される音声のクエリを生成
        skipStrQuery = (await voicevox.post(
            `/audio_query?text=${encodeURI("以下略")}&speaker=0`))
            .data.accent_phrases;
        // スピーカー一覧のデータを取得
        for (const i of (await voicevox.get("/speakers")).data) {
            speakersName.push(i.name);
            for (const j of i.styles) {
                speakersInfo.set(j.id, `${i.name}(${j.name})`);
            }
        }
    }
    catch (error) {
        // エンジンが起動していなかったら、起動する
        const vvProc = spawn(config.enginePath);
        vvProc.stdout?.on("data", d => console.log(d.toString()));
        const isSuccess = await new Promise<true | Error>(rs => {
            vvProc.on("close", c => rs(new Error(`エンジンがコード${c}で終了しました。`)));
            vvProc.on("error", e => rs(e));
            vvProc.stderr?.on("data", (b: Buffer) => {
                const d = b.toString();
                console.log(d);
                if (d.match(/^INFO:\s+Uvicorn running on/)) {
                    console.log("エンジンを起動しました");
                    rs(true);
                }
            });
        });
        // 正常に起動したら
        if (isSuccess === true) {
            await engineSetUp();
        }
        else {
            throw isSuccess;
        }
    }
};

/** 初期化 */
export const botInit = async () => {
    // 設定ファイル読み込み
    config = toml.parse(fs.readFileSync("./config.toml").toString());
    // AxiosInstanceを作る
    voicevox = axios.create({ baseURL: config.engineUrl });
    // エンジンを起動
    await engineSetUp();
};

/** Botクライアント */
export const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES]
});

/** 設定 */
export let config = {
    token: "",
    guildId: "",
    inviteUrl: "",
    readMaxCharLimit: 0,
    readMaxCharDefault: 0,
    enginePath: "",
    engineUrl: "http://127.0.0.1:50021"
};

/** VOICEVOXクライアント */
export let voicevox = axios.create({ baseURL: config.engineUrl });

/** 省略時に追加される音声のクエリ */
export let skipStrQuery: unknown[] = [];

/** 読み上げするギルド */
export const managers = new Map<string, ConnectionManager>();

/** スピーカーの情報 */
export const speakersInfo = new Map<number, string>();

/** スピーカーの名前一覧 */
export const speakersName: string[] = [];

/** コマンド */
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