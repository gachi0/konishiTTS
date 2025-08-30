import { GuildMember, VoiceBasedChannel } from "discord.js";
import { client, db, managers } from "../lib/bot";
import { getOrCreate } from "../service/db";
import { createEvent } from "../service/types";

export default createEvent("voiceStateUpdate", async (before, after) => {

  if (!after.member) return;

  // ミュートなどの操作なら帰る
  if (before.channel === after.channel) return;

  // 入室
  else if (!before.channel) {
    if (!after.channel) return;
    await vcJoin(after.member, after.channel);
  }
  // 退出
  else if (!after.channel) {
    await vcLeave(after.member, before.channel);
  }
  // 移動
  else {
    await vcJoin(after.member, after.channel);
    await vcLeave(after.member, before.channel);
  }
});

/** ボイスチャンネルに参加 */
const vcJoin = async (member: GuildMember, vc: VoiceBasedChannel) => {
  const manager = managers.get(vc.guild.id);
  if (!manager) return;

  const guild = await db.kGuild.upsert(getOrCreate(vc.guildId));
  const user = await db.kUser.upsert(getOrCreate(member.id));

  // 参加したのが自分だった場合、読み上げない
  if (member.id === client.user?.id) return;
  if (!guild.vcReadName) return;
  if (manager.conn.joinConfig.channelId === vc.id) {
    await manager.speak(
      guild.joinText.replace("{name}", member.displayName),
      user.speaker ?? guild.speaker,
    );
  }
};

const vcLeave = async (member: GuildMember, vc: VoiceBasedChannel) => {
  const manager = managers.get(vc.guild.id);
  if (!manager || manager.chId === vc.id) return;

  const guild = await db.kGuild.upsert(getOrCreate(vc.guildId));

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

