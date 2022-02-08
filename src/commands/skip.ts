import { SlashCommandBuilder } from "@discordjs/builders";
import { ICommand, managers } from "../bot";

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("skip")
        .addIntegerOption(o => o
            .setName("count")
            .setDescription("スキップするメッセージの数 (省略された場合は1つのみがスキップされます)"))
        .setDescription("今読み上げているメッセージをスキップします。"),
    guildOnly: true,
    execute: async intr => {
        if (!intr.guildId) return;
        const manager = managers.get(intr.guildId);
        if (!manager) {
            await intr.reply("ボイスチャンネルに入っていません！");
            return;
        }
        const count = intr.options.getInteger("count");
        manager.skip(count ?? 1);
        await intr.reply("スキップしました！");
    }
};