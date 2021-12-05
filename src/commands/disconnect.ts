import { ICommand, managers } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("disconnect")
        .setDescription("botをボイスチャンネルから切断します！");
    execute = async (intr: CommandInteraction) => {
        if (!managers[intr.guildId]) {
            await intr.reply("ボイスチャンネルに参加してません！");
            return;
        }
        const vi = managers[intr.guildId];
        delete managers[intr.guildId];
        vi.conn.disconnect();
        await intr.reply("切断しました！");
    };
};
