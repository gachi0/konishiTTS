import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  // botのトークン(必須)
  DISCORD_TOKEN: z.string(),
  // 招待URL
  INVITE_URL: z.url().default('https://discord.com/api/oauth2/authorize?client_id={clientId}&permissions=3146752&scope=bot%20applications.commands'),
  // 設定可能な最大読み上げ文字数
  READ_MAX_CHAR_LIMIT: z.coerce.number().int().default(200),
  // 最大読み上げ文字数のデフォルト
  READ_MAX_CHAR_DEFAULT: z.coerce.number().int().default(70),
  // VOICEVOXエンジンのパス
  ENGINE_PATH: z.string().default('C:/Program Files/VOICEVOX/vv-engine/run.exe'),
  // VOICEVOXエンジンのエンドポイント
  ENGINE_API_URL: z.url().default('http://127.0.0.1:50021'),
});

export const env = envSchema.parse(process.env);
