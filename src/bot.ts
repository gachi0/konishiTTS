import { ChatInputCommandInteraction, Client, ClientEvents, GatewayIntentBits, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, TextBasedChannel } from "discord.js";
import axios from "axios";
import { spawn } from "child_process";
import ConnectionManager from "./service/connectionManager";
import { PrismaClient } from "@prisma/client";
import { enginePath, engineUrl } from "../env";

export const db = new PrismaClient();

/** Botクライアント */
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent
  ]
});

/** VOICEVOXクライアント */
export let voicevox = axios.create({ baseURL: engineUrl });

/** 省略時に追加される音声のクエリ */
export let skipStrQuery: unknown[] = [];

/** 読み上げするギルド */
export const managers = new Map<string, ConnectionManager>();

/** スピーカーの情報 */
export let speakers = new Map<number, string>();


export const engineSetUp = async () => {
  console.log("エンジンセットアップ");
  try {
    // 省略時に追加される音声のクエリを生成
    const skipStrData = await voicevox.post(
      `/audio_query?text=${encodeURI("以下略")}&speaker=0`,
    );
    skipStrQuery = skipStrData.data.accent_phrases;

    const rawSpeakers = await voicevox.get("/speakers");
    speakers = new Map(
      rawSpeakers.data.flatMap((speaker: any) => {
        return speaker.styles.map((style: any) => [
          style.id, `${speaker.name}(${style.name})`
        ]);
      }
      )
    );

  }
  catch (error) {
    console.log(error);
    // エンジンが起動していなかったら、起動する
    const vvProc = spawn(enginePath);
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

