import { ChatInputApplicationCommandData, ChatInputCommandInteraction, Client, ClientEvents, TextBasedChannel } from "discord.js";

/** コマンド */
export interface ICommand {
  data: ChatInputApplicationCommandData;
  adminOnly?: boolean;
  guildOnly?: boolean;
  execute(intr: ChatInputCommandInteraction, ch?: TextBasedChannel): Promise<void>;
}

// 未処理コマンドデータ
export type IRawCommand = Omit<ICommand, 'data'> & {
  data:
  | ChatInputApplicationCommandData
  | (() => ChatInputApplicationCommandData);
};

/** クライアントイベント型付けラッパ */
export const createEvent = <K extends keyof ClientEvents>(
  name: K,
  listener: (...args: ClientEvents[K]) => Promise<void>,
) => ({ name, listener });
