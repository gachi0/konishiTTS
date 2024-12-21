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

export interface ICMD {
  name: string,
  description: string,
  args: ApplicationCommandOptionData;
  adminOnly?: boolean;
  guildOnly?: boolean;
  execute(
    intr: ChatInputCommandInteraction,
    ch?: TextBasedChannel,
  ): Promise<void>;
}

type OptionOmitName = Omit<ApplicationCommandOptionData, 'name'>;
type ArgsType = Record<string, OptionOmitName>;

// nameの値によってlistenerの引数の型を決定する型
type ListenerArg<T extends ApplicationCommandOptionType> =
  T extends ApplicationCommandOptionType.Boolean ? boolean :
  T extends ApplicationCommandOptionType.Integer ? number :
  T extends ApplicationCommandOptionType.Number ? number :
  T extends ApplicationCommandOptionType.String ? string :
  never;


type ListenerArgs<T extends ArgsType> = {
  [K in keyof T]:
  T[K] extends OptionOmitName
  ? ListenerArg<T[K]["type"]> | null
  : never;
};


/** クライアントコマンドラッパ */
export const createCommand = <
  T extends ArgsType
>(props: {
  name: string,
  description: string,
  options: T,
  execute: (
    args: ListenerArgs<T>
  ) => Promise<void>,
}) => {

};

const commandA = createCommand({
  name: "A",
  description: "AA",
  options: {
    isunchi: {
      description: "AA",
      type: ApplicationCommandOptionType.Boolean,
    }
  } as const,
  execute: async (args) => {
    args.isunchi;
  }
});