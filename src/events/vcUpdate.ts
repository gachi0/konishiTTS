import { VoiceState } from "discord.js";
import { client, IEvent, managers } from "../bot";

export default new class implements IEvent {
    name = "voiceStateUpdate";
    execute = async (before: VoiceState, after: VoiceState) => {
        if (!after.member) return;
        // 通話退出
        if (!after.channel) {
            // 通話が自分だけになったら抜ける
            if (before.channel?.members.size === 1) {
                managers[after.guild.id].conn.disconnect();
            }
            // 自分が通話から抜けたら
            if (after.member.id === client.user?.id) {
                delete managers[after.guild.id];
            }
        }
    };
};
