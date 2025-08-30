import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { commands } from "..";
import { botDescription, helpEmbedFromCommand } from "./components";
import { ICommand } from "../../service/types";
import { vvInfo } from "../../lib/voicevox";

export const genHelp = (commandArray: ICommand[]): ICommand => ({
  data: {
    name: 'help',
    description: 'Botの使い方を表示します。',
    options: [
      {
        name: 'command',
        description: '詳細な使い方が知りたいコマンドの名前を選んでください。入力せずに送信した場合ボット全体の使い方を送信します。',
        type: ApplicationCommandOptionType.String,
        choices: commandArray.map(c => ({ name: c.data.name, value: c.data.name })),
      },
    ],
  },
  async execute(intr: ChatInputCommandInteraction) {
    const opt = intr.options.getString("command");
    if (opt) {
      const cmd = commands.get(opt);
      await intr.reply(
        cmd
          ? { embeds: helpEmbedFromCommand(cmd) }
          : "存在しないコマンドです…",
      );
    } else {
      await intr.reply({
        embeds: botDescription([...commands.values()], vvInfo.speakers),
      });
    }
  },
});

