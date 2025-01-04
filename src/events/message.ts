import { db, managers } from "../bot";
import { upsertQuery } from "../service/db";
import { createEvent } from "../service/types";

export default createEvent("messageCreate", async msg => {
  if (msg.author.bot
    || msg.content.startsWith("!")
    || !msg.guildId
  ) return;

  // botが通話に参加してなければスキップ
  const manager = managers.get(msg.guildId);
  if (!manager) return;
  // 読み上げ対象のチャンネルでなければスキップ
  if (![manager.chId, manager.conn.joinConfig.channelId].includes(msg.channelId)) return;

  // 設定を取得
  const user = await db.kUser.upsert(upsertQuery(msg.author.id));
  if (!user.isRead) return;

  const guild = await db.kGuild.upsert(upsertQuery(msg.guildId));

  // 読み上げるための文字列
  let text = guild.readName ? msg.author.username : '';
  text += msg.content;

  // いろいろ読み上げないようにする
  text = text.replace(/https?:\/\S*/g, "url")
    .replace(/<(@[!&]?|#)\d+>/g, "メンション")
    .replace(/(?<=<a?:\w+):\d+>|<a?:(?=\w+:\d+>)/g, "") // 絵文字名は残し絵文字idを消す
    .replace(/[wWｗＷ]{3,}/g, ""); // ｗｗｗｗｗはわらに置換

  // ファイルが送られてきていたらファイルの件数を読み上げ
  text += msg.attachments.size ? `${msg.attachments.size}件のファイル` : '';

  // 文字列を読み上げる
  await manager.speak(text, guild, user);
});
