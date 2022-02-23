import { ICommand, speakersInfo } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { GuildEntity, UserEntity } from "../db";

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("user_settings")
        .setDescription("ユーザー設定の一覧を表示します！"),
    execute: async intr => {
        if (!intr.guildId) return;
        const user = await UserEntity.get(intr.user.id);
        const guild = await GuildEntity.get(intr.guildId);
        await intr.reply({
            embeds: [new MessageEmbed()
                .setTitle(`${intr.user.username}の設定`)
                .addField("読み上げ", user.isRead ? "ON" : "OFF")
                .addField("声", `${speakersInfo.get(user.speaker ?? guild.speaker)}`)
            ],
            ephemeral: true
        });
    }
};