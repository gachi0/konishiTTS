import { ChatInputCommandInteraction, Client, ClientEvents, GatewayIntentBits, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, TextBasedChannel } from "discord.js";
import fs from "fs";
import axios from "axios";
import { spawn } from "child_process";
import ConnectionManager from "./domain/connectionManager";
import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { configDotenv } from "dotenv";

export const db = new PrismaClient();

/** Botクライアント */
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent
  ]
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
  execute(intr: ChatInputCommandInteraction, ch?: TextBasedChannel): Promise<void>;
}


export interface IClientEvent<K extends keyof ClientEvents> {
  name: K;
  listener: (...args: ClientEvents[K]) => Promise<void>;
}

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
  config.enginePath = process.env.enginePath ?? '';
  config.engineUrl = process.env.engineUrl ?? '';
  config.guildId = process.env.guildId ?? '';
  config.token = process.env.token ?? '';

  // AxiosInstanceを作る
  voicevox = axios.create({ baseURL: config.engineUrl });
  // エンジンを起動
  await engineSetUp();
};
