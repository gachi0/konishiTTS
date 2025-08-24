import { ApplicationCommandOptionType } from "discord.js";
import { managers } from "../lib/bot";
import { ICommand } from "../service/types";

const command: ICommand = {
  data: {
    name: "skip",
    description: "今読み上げているメッセージをスキップします。",
    options: [
      {
        type: ApplicationCommandOptionType.Integer,
        name: "skip",
        description: "スキップする数",
      }
    ]
  },
  guildOnly: true,

  async execute(intr) {
    if (!intr.guildId) return;
    const count = intr.options.getInteger("count");

    const manager = managers.get(intr.guildId);

    if (!manager) {
      await intr.reply("ボイスチャンネルに入っていません！");
    } else {
      manager.skip(count ?? 1);
      await intr.reply("スキップしました！");
    }
  },
};

export default command;