import { ICommand, managers } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("leave")
        .setDescription("botをボイスチャンネルから退出させます！");
    guildOnly = true;
    execute = async (intr: CommandInteraction) => {
        if (!intr.guildId) return;
        if (!managers[intr.guildId]) {
            await intr.reply("ボイスチャンネルに参加してません！");
            return;
        }
        managers[intr.guildId]?.conn.disconnect();
        await intr.reply("退出しました！");
    };
};