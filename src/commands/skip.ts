import { SlashCommandBuilder } from "@discordjs/builders";
import { ICommand, managers } from "../bot";

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("今読み上げているメッセージをスキップします。"),
    guildOnly: true,
    execute: async intr => {
        if (!intr.guildId) return;
        const manager = managers.get(intr.guildId);
        if (!manager) {
            await intr.reply("ボイスチャンネルに入っていません！");
            return;
        }
        await manager.skip();
        await intr.reply("スキップしました！");
    }
};