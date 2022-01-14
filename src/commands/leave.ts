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
        const manager = managers.get(intr.guildId);
        if (!manager) {
            await intr.reply("ボイスチャンネルに参加してません！");
            return;
        }
        manager.conn.disconnect(); 
        // deleteはvoiceStateUpdateイベントの中でされます
        await intr.reply("退出しました！");
    };
};