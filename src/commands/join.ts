import { ICommand, managers } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, TextChannel } from "discord.js";
import { joinVoiceChannel, DiscordGatewayAdapterCreator } from "@discordjs/voice";
import ConnectionManager from "../connectionManager";

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription("読み上げを開始します！"),
    guildOnly: true,
    execute: async intr => {
        if (!(intr.member instanceof GuildMember) || !intr.guild) return;
        const vc = intr.member.voice.channel;
        // vcに参加してない
        if (!vc) {
            await intr.reply("ボイスチャンネルに参加してください！");
            return;
        }
        // 入れない
        if (!vc.joinable) {
            await intr.reply("ボイスチャンネルに参加することができません！権限や人数を確認してください！");
            return;
        }
        // チャンネルが見えない
        if (!(intr.channel as TextChannel)?.viewable) {
            await intr.reply("チャンネルを見る権限がないため、メッセージを読み上げることが出来ません…");
            return;
        }
        const conn = joinVoiceChannel({
            guildId: intr.guild.id,
            channelId: vc.id,
            adapterCreator: intr.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
        });
        managers.set(intr.guild.id, new ConnectionManager(intr.channelId, conn));
        await intr.reply("参加しました！このチャンネルでのメッセージの読み上げを開始します！");
    }
};