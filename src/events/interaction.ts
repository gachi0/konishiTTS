import { CommandInteraction, GuildTextBasedChannel, Permissions } from "discord.js";
import { clienton, commands } from "../bot";

clienton("interactionCreate", async intr => {
    if (intr instanceof CommandInteraction) {
        const cmd = commands.get(intr.commandName);
        if (!cmd) return;
        if (cmd.guildOnly && !intr.guild) {
            await intr.reply("このコマンドはサーバー内で使用してください！");
            return;
        }
        if (cmd.adminOnly && !(intr.member?.permissions as Permissions).has("ADMINISTRATOR")) {
            await intr.reply({ content: "このコマンドは管理者のみが使えます！", ephemeral: true });
            return;
        }
        let ch = intr.channel;
        if (!ch) {
            ch = await intr.client.channels.fetch(intr.channelId) as GuildTextBasedChannel;
            if (!ch) return;
        }
        await cmd.execute(intr, ch).catch(async e =>
            await intr[intr.replied || intr.deferred ? "followUp" : "reply"](`エラーが発生しました…\r\`\`\`\r${e}\r\`\`\``)
        );
    }
});