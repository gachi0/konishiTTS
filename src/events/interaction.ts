import { ChatInputCommandInteraction, codeBlock, GuildMember, GuildTextBasedChannel, PermissionsBitField } from "discord.js";
import commands from "../commands";
import { createEvent } from "../service/types";

const isAdmin = (m: GuildMember) => m.permissions.has("Administrator");

export default createEvent("interactionCreate", async intr => {
  if (intr instanceof ChatInputCommandInteraction) {
    await chatInputIntr(intr);
  }
});

const chatInputIntr = async (intr: ChatInputCommandInteraction) => {
  const cmd = commands.get(intr.commandName);
  const mem = intr.member;
  const ch = intr.channel;

  if (!cmd) {
    await intr.reply("コマンドありません");
    return;
  }

  if (
    cmd.adminOnly
    && mem instanceof GuildMember
    && !mem.permissions.has("Administrator")
  ) {
    await intr.reply({
      content: "このコマンドは管理者のみが使えます",
      ephemeral: true
    });
    return;
  }

  if (!ch) {
    await intr.reply("channelがnull");
    return;
  }

  await cmd.execute(intr, ch)
    .catch(async (e: Error) => {
      const method = intr.replied || intr.deferred ? "followUp" : "reply";
      const msg = [
        'エラーが発生しました…',
        codeBlock(`${e.message} ${e.stack}`),
      ].join('\n');

      await intr[method](msg);
    });
};