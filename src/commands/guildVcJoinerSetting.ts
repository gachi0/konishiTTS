import { ICommand } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildEntity } from "../db";
import { MessageEmbed } from "discord.js";

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("guild_vc_joiner_setting")
        .addStringOption(o => o
            .setName("read_text")
            .setDescription("入室時に読み上げられる文字列。{name}は入室したユーザー名に置き換えられます。"))
        .addBooleanOption(o => o
            .setName("is_read")
            .setDescription("VC入室時に入室者の名前を読み上げるかどうか"))
        .setDescription("ボイスチャンネルに人が入ってきた場合に名前を読み上げる設定"),
    guildOnly: true,
    adminOnly: true,
    execute: async intr => {
        const txt = intr.options.getString("read_text");
        const isRead = intr.options.getBoolean("is_read");
        if (!intr.guildId) return;
        const guild = await GuildEntity.get(intr.guildId);
        if (!txt && isRead === null) {
            await intr.reply({
                embeds: [new MessageEmbed()
                    .addField("入室時に読み上げられる文字列", guild.joinerText)
                    .addField("入室時に入室者の名前を読み上げるかどうか", guild.joinerReadName.toString())]
            });
            return;
        }
        const embeds: MessageEmbed[] = [];
        if (txt) {
            guild.joinerText = txt;
            embeds.push(new MessageEmbed()
                .setDescription(`入室時に読み上げられる文字列を\`${txt}\`に設定しました！`));
        }
        if (isRead !== null) {
            guild.joinerReadName = isRead;
            embeds.push(new MessageEmbed()
                .setDescription(`入室時に入室者の名前を読み上げ${isRead ? "る" : "ない"}ようにします！`));
        }
        await GuildEntity.repo.save(guild);
        await intr.reply({ embeds: embeds });
    }
};