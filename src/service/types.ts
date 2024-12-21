import { ApplicationCommandBooleanOptionData, ApplicationCommandNumericOptionData, ApplicationCommandOptionData, ApplicationCommandOptionType, ApplicationCommandStringOptionData, ChatInputApplicationCommandData, ChatInputCommandInteraction, ClientEvents, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, TextBasedChannel } from "discord.js";

/** コマンド */
export interface ICommand {
  data: ChatInputApplicationCommandData;
  adminOnly?: boolean;
  guildOnly?: boolean;
  execute(intr: ChatInputCommandInteraction, ch?: TextBasedChannel): Promise<void>;
}


/** クライアントイベント型付けラッパ */
export const createEvent = <K extends keyof ClientEvents>(
  name: K,
  listener: (...args: ClientEvents[K]) => Promise<void>,
) => ({
  name: name, listener: listener,
});