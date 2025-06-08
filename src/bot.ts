import { Client, GatewayIntentBits, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, TextBasedChannel } from "discord.js";
import ConnectionManager from "./service/connectionManager";
import { PrismaClient } from "@prisma/client";
import { enginePath, engineUrl } from "../env";
import createClient from "openapi-fetch";
import { ICommand } from "./service/types";

export const db = new PrismaClient();

/** Botクライアント */
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent
  ]
});

/** 読み上げするギルド */
export const managers = new Map<string, ConnectionManager>();