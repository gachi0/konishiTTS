import { ChatInputApplicationCommandData, ChatInputCommandInteraction, Client, ClientEvents, TextBasedChannel } from "discord.js";

/** コマンド */
export interface ICommand {
  data: ChatInputApplicationCommandData;
  adminOnly?: boolean;
  guildOnly?: boolean;
  execute(intr: ChatInputCommandInteraction, ch?: TextBasedChannel): Promise<void>;
}

// ICommandから'data'プロパティを除外し、新しい'data'の型定義と結合する
export type INotParsedCommand = Omit<ICommand, 'data'> & {
  data:
  | ChatInputApplicationCommandData
  | (() => ChatInputApplicationCommandData);
};

/** クライアントイベント型付けラッパ */
export const createEvent = <K extends keyof ClientEvents>(
  name: K,
  listener: (...args: ClientEvents[K]) => Promise<void>,
) => (c: Client) => c.on(name, listener);