import { SlashCommandBuilder } from "discord.js";
import { managers } from "../bot";
import { ICommand } from "../service/types";

const command: ICommand = {
  data: {
    name: "leave",
    description: "ボイスチャンネルから退出します",
  },
  guildOnly: true,
  execute: async intr => {
    if (!intr.guildId) return;

    const manager = managers.get(intr.guildId);
    if (!manager) {
      await intr.reply("ボイスチャンネルに参加してません！");
      return;
    }

    // deleteはvoiceStateUpdateイベントの中でされます
    manager.conn.disconnect();
    await intr.reply("退出しました！");
  }
};

export default command;