import { CommandInteraction, Interaction, Permissions, TextBasedChannels } from "discord.js";
import { allImport, ICommand, IEvent } from "../bot";

const cmds: Record<string, ICommand> = {};
// コマンドを取ってくる
+ async function () {
    for (const c of await allImport("commands") as ICommand[]) {
        cmds[c.data.name] = c;
    }
}();

export default new class implements IEvent {
    name = "interactionCreate";
    execute = async (intr: Interaction) => {
        if (intr instanceof CommandInteraction) {
            const cmd = cmds[intr.commandName];
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
                ch = await intr.client.channels.fetch(intr.channelId) as TextBasedChannels;
                if (!ch) return;
            }
            await cmd.execute(intr, ch).catch(async e =>
                await intr[intr.replied || intr.deferred ? "followUp" : "reply"](`エラーが発生しました…\r\`\`\`\r${e}\r\`\`\``)
            );
        }
    };
};