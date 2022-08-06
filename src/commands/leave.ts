import { SlashCommandBuilder } from "discord.js";
import { ICommand, managers } from "../bot";

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("botをボイスチャンネルから退出させます！"),
    guildOnly: true,
    execute: async intr => {
        if (!intr.guildId) return;
        const manager = managers.get(intr.guildId);
        if (!manager) {
            await intr.reply("ボイスチャンネルに参加してません！");
            return;
        }
        manager.conn.disconnect();
        // deleteはvoiceStateUpdateイベントの中でされます
        await intr.reply("退出しました！");
    }
};