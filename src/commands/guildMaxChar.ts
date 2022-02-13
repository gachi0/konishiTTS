import { config, ICommand } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildEntity } from "../db";

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("guild_max_char")
        .addNumberOption(o => o
            .setName("max_char")
            .setDescription("制限文字数(省略された場合はデフォルト値になります。)"))
        .setDescription("読み上げる最大文字数を設定します。"),
    guildOnly: true,
    adminOnly: true,
    execute: async intr => {
        if (!intr.guildId) return;
        const maxChar = intr.options.getNumber("max_char") ?? config.readMaxCharDefault;
        if (maxChar < 0 || config.readMaxCharLimit < maxChar) {
            await intr.reply({
                content: `0から${config.readMaxCharLimit}までの範囲で指定してください！`,
                ephemeral: true
            });
            return;
        }
        const guild = await GuildEntity.get(intr.guildId);
        guild.maxChar = maxChar;
        await GuildEntity.repo.save(guild);
        await intr.reply(`読み上げる最大文字数を${maxChar}に設定しました！`);
    }
};