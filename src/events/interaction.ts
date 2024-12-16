import { ChatInputCommandInteraction, GuildTextBasedChannel, PermissionsBitField } from "discord.js";
import { createEvent } from "../domain/util";
import commands from "../commands";

createEvent("interactionCreate", async intr => {
  if (intr instanceof ChatInputCommandInteraction) {
    const cmd = commands.get(intr.commandName);

    if (!cmd) return; // 存在しないコマンド名だった場合

    if ( // 管理者じゃない場合
      cmd.adminOnly &&
      !(
        intr.member?.permissions instanceof PermissionsBitField &&
        intr.member.permissions.has("Administrator")
      )
    ) {
      await intr.reply({
        content: "このコマンドは管理者のみが使えます",
        ephemeral: true
      });
      return;
    }

    let ch = intr.channel;
    if (!ch) {
      ch = await intr.client.channels.fetch(intr.channelId) as GuildTextBasedChannel;
      if (!ch) return;
    }

    await cmd.execute(intr, ch).catch(async (e: Error) =>
      await intr[
        intr.replied || intr.deferred ? "followUp" : "reply"
      ](
        "エラーが発生しました…\n" + "```\n" + e + "\n```"
      )
    );
  }
});