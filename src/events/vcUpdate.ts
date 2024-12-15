import { GuildMember, VoiceBasedChannel } from "discord.js";
import { client, managers } from "../bot";
import { GuildEntity } from "../db";
import { clienton } from "../domain/util";

clienton("voiceStateUpdate", async (before, after) => {

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

  const guild = await GuildEntity.get(vc.guild.id);

  // 参加したのが自分だった場合、読み上げない
  if (member.id === client.user?.id) return;
  if (manager.conn.joinConfig.channelId === vc.id && guild.joinerReadName) {
    await manager.speak(
      guild.joinerText.replace("{name}", member.displayName), guild
    );
  }
};

const vcLeave = async (member: GuildMember, vc: VoiceBasedChannel) => {
  const manager = managers.get(vc.guild.id);
  if (!manager || manager.chId === vc.id) return;

  const guild = await GuildEntity.get(vc.guild.id);

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

