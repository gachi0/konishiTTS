import { ICommand } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildEntity } from "../db";

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("guild_speed")
        .addNumberOption(o => o
            .setName("speed")
            .setDescription("0.5から2.0までの範囲で指定してください")
            .setRequired(true))
        .setDescription("このサーバーでの話速を設定します"),
    guildOnly: true,
    adminOnly: true,
    execute: async intr => {
        if (!intr.guildId) return;
        const speed = intr.options.getNumber("speed", true);
        if (!(0.5 <= speed && speed <= 2)) {
            await intr.reply({
                content: "0.5から2.0までの範囲で指定してください！",
                ephemeral: true
            });
            return;
        }
        const guild = await GuildEntity.get(intr.guildId);
        guild.speed = speed;
        await GuildEntity.repo.save(guild);
        await intr.reply(`話速を${speed}に設定しました！`);
    }
};