import { ChatInputCommandInteraction } from "discord.js";
import commands from "..";
import { botDescription, commandHelpEmbed } from "./components";

type Replyable = Parameters<ChatInputCommandInteraction['reply']>[0];

export const execute = async (intr: ChatInputCommandInteraction) => {
  const opt = intr.options.getString("command");
  await intr.reply(cmdFromRep(opt));
};

const cmdFromRep = (option: string | null): Replyable => {
  if (option) {
    const cmd = commands.get(option);
    return (cmd
      ? { embeds: [commandHelpEmbed(cmd)] }
      : "存在しないコマンドです…");

  } else {
    return { embeds: botDescription([...commands.values()]) };
  }
};
