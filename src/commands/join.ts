import { managers } from "../bot";
import { GuildMember } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
import ConnectionManager from "../service/connectionManager";
import { ICommand } from "../service/types";

const command: ICommand = {
  data: {
    name: "join",
    description: "参加します",
  },
  guildOnly: true,

  execute: async intr => {
    if (!intr.guild || !intr.guildId) return;
    if (!(intr.member instanceof GuildMember)) return;

    const vc = intr.member.voice.channel;

    // vcに参加してない
    if (!vc) {
      await intr.reply("ボイスチャンネルに参加してください！");
      return;
    }

    // 入れない
    if (!vc.joinable) {
      await intr.reply("ボイスチャンネルに参加することができません…権限や人数を確認してください。");
      return;
    }

    // チャンネルが見えない
    if (
      !intr.channel
      || !("viewable" in intr.channel)
      || !intr.channel.viewable
    ) {
      await intr.reply("チャンネルを見えないため、メッセージを読み上げることが出来ません…");
      return;
    }

    const conn = joinVoiceChannel({
      guildId: intr.guildId,
      channelId: vc.id,
      adapterCreator: intr.guild.voiceAdapterCreator
    });
    managers.set(intr.guildId, new ConnectionManager(intr.channelId, conn));
    await intr.reply("参加しました！このチャンネルでのメッセージの読み上げを開始します！");
  }
};

export default command;