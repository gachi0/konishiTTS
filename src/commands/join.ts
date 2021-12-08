import { ICommand, managers, ConnectionManager } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("join")
        .setDescription("読み上げを開始します！");
    guildOnly = true;
    execute = async (intr: CommandInteraction) => {
        if (!(intr.member instanceof GuildMember) || !intr.guild) return;
        const vc = intr.member.voice.channel;
        // vcに参加してない
        if (!vc) {
            await intr.reply("ボイスチャンネルに参加してください！");
            return;
        }
        // 入れない
        if (!vc.joinable) {
            await intr.reply("ボイスチャンネルに参加することができません！");
        }
        const conn = joinVoiceChannel({
            guildId: intr.guildId,
            channelId: vc.id,
            adapterCreator: intr.guild.voiceAdapterCreator
        });
        managers[intr.guildId] = new ConnectionManager(intr.channelId, conn);
        await intr.reply("参加しました！このチャンネルでのメッセージの読み上げを開始します！");
    };
};
