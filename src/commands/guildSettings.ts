import { ICommand, speakersInfo } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { GuildEntity } from "../db";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("guild_settings")
        .setDescription("ユーザー設定の一覧を表示します！");
    guildOnly = true;
    execute = async (intr: CommandInteraction) => {
        if (!intr.guild || !intr.guildId) return;
        const guild = await GuildEntity.get(intr.guildId);
        await intr.reply({
            embeds: [new MessageEmbed()
                .setTitle(`${intr.guild.name}の設定`)
                .addField("デフォルトの声", speakersInfo[guild.speaker])
                .addField("読み上げる文字数の上限", guild.maxChar.toString())
                .addField("名前の読み上げ", guild.readName ? "ON" : "OFF")
                .addField("話速(0.5~2.0)", guild.speed.toString())
                .addField("音高(-0.15~0.15)", guild.pitch.toString())
            ],
        });
    };
};