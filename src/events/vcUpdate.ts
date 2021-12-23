import { GuildMember, StageChannel, VoiceChannel, VoiceState } from "discord.js";
import { client, IEvent, managers } from "../bot";
import { GuildEntity } from "../db";

type vcOrStage = VoiceChannel | StageChannel;

export default new class implements IEvent {
    name = "voiceStateUpdate";
    execute = async (before: VoiceState, after: VoiceState) => {
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
            // 自分が通話から抜けたら
            if (after.member.id === client.user?.id) {
                delete managers[before.channel.guild.id];
            }
        }
        // 移動
        else {
            await vcJoin(after.member, guild, after.channel);
        }
    };
};

/** ボイスチャンネルに参加 */
const vcJoin = async (member: GuildMember, guild: GuildEntity, vc: vcOrStage) => {
    const manager = managers[vc.guild.id];
    if (manager) {
        await manager.speak(`よお${member.displayName}`, guild);
    }
};