import { GuildMember, StageChannel, VoiceChannel } from "discord.js";
import { client, clienton, managers } from "../bot";
import { GuildEntity } from "../db";

type vcOrStage = VoiceChannel | StageChannel;

clienton("voiceStateUpdate", async (before, after) => {
    if (!after.member) return;
    const guild = await GuildEntity.get(after.guild.id);
    // ミュートなどの操作なら帰る
    if (before.channel === after.channel) {
        return;
    }
    // 入室
    else if (!before.channel) {
        if (!after.channel) return;
        await vcJoin(after.member, guild, after.channel);
    }
    // 退出
    else if (!after.channel) {
        await vcLeave(after.member, guild, before.channel);
    }
    // 移動
    else {
        await vcJoin(after.member, guild, after.channel);
        await vcLeave(after.member, guild, before.channel);
    }
});

/** ボイスチャンネルに参加 */
const vcJoin = async (member: GuildMember, guild: GuildEntity, vc: vcOrStage) => {
    const manager = managers.get(vc.guild.id);
    // 参加したのが自分だった場合、読み上げない
    if (member.id === client.user?.id) {
        return;
    }
    if (manager && manager.conn.joinConfig.channelId === vc.id && guild.joinerReadName) {
        await manager.speak(
            guild.joinerText.replace("{name}", member.displayName), guild);
    }
};

const vcLeave = async (member: GuildMember, guild: GuildEntity, vc: vcOrStage) => {
    const manager = managers.get(vc.guild.id);
    if (!manager || manager.chId === vc.id) return;
    // 自分が通話から抜けたら
    if (member.id === client.user?.id) {
        managers.delete(guild.id);
    }
    // VCに自分しかいなくなったら
    if (vc.members.size === 1) {
        manager.conn.disconnect();
        await vc.send("VCに誰もいなくなったため、切断されました。");
    }
};