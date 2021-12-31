import { ICommand, speakersInfo } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { GuildEntity, UserEntity } from "../db";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("user_settings")
        .setDescription("ユーザー設定の一覧を表示します！");
    execute = async (intr: CommandInteraction) => {
        if (!intr.guildId) return;
        const user = await UserEntity.get(intr.user.id);
        const guild = await GuildEntity.get(intr.guildId);
        intr.reply({
            embeds: [new MessageEmbed()
                .setTitle(`${intr.user.username}の設定`)
                .addField("声", speakersInfo[user.speaker ?? guild.speaker])
                .addField("音高(-0.15~0.15)", `${user.pitch ?? guild.pitch}`)
            ],
            ephemeral: true
        });
    };
};