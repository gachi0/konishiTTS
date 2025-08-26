import { Client, GatewayIntentBits } from "discord.js";
import ConnectionManager from "../service/connectionManager";
import { PrismaClient } from "@prisma/client";
import { ICommand } from "../service/types";

/** PRISMA CLIENT */
export const db = new PrismaClient();

/** Botクライアント */
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
  ]
});

/** 読み上げするギルド */
export const managers = new Map<string, ConnectionManager>();

/** コマンド情報 */
export let commands: Map<string, ICommand>;