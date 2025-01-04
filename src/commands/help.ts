import { ChatInputCommandInteraction } from "discord.js";
import commands from ".";
import { botDescription, commandHelpEmbed } from "../components/help";
import { speakers } from "../bot";


export const execute = async (intr: ChatInputCommandInteraction) => {
  const option = intr.options.getString("command");
  if (option) {
    const cmd = commands.get(option);
    if (!cmd) {
      await intr.reply("存在しないコマンドです…");
    } else {
      await intr.reply({ embeds: [commandHelpEmbed(cmd)] });
    }
  }
  else {
    await intr.reply({
      embeds: botDescription(
        [...commands.values()], [...speakers.values()]
      )
    });
  }
};

