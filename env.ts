import 'dotenv/config';

if (!process.env.token) {
  throw new Error("環境変数にトークンありませんでした。");
}

/// トークン
export const token = process.env.token;

export const commandRegistGuildId = "855821246745542696";

export const inviteUrl = "https://discord.com/api/oauth2/authorize?client_id={clientId}&permissions=3146752&scope=bot%20applications.commands";

export const readMaxCharLimit = 200;

export const readMaxCharDefault = 70;

export const enginePath = "C:/Program Files/VOICEVOX/vv-engine/run.exe";

export const engineUrl = "http://127.0.0.1:50021";

