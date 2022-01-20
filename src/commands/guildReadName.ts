import { ICommand } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildEntity } from "../db";

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("guild_read_name")
        .addBooleanOption(o => o
            .setName("read_name")
            .setDescription("読み上げる場合はTrueを、読み上げたくない場合はFalseを指定してください")
            .setRequired(true))
        .setDescription("Botが名前を読み上げるかどうかを切り替えます！"),
    guildOnly: true,
    execute: async intr => {
        if (!intr.guildId) return;
        const readName = intr.options.getBoolean("read_name", true);
        const guild = await GuildEntity.get(intr.guildId);
        guild.readName = readName;
        await GuildEntity.repo.save(guild);
        await intr.reply(`名前を読み上げ${readName ? "る" : "ない"}ようにします！`);
    }
};