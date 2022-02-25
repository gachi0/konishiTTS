import { clienton, managers } from "../bot";
import { GuildEntity, UserEntity } from "../db";

clienton("messageCreate", async msg => {
    if (msg.author.bot
        || msg.content.startsWith("!")
        || !msg.guildId) return;

    // botが通話に参加してなければスキップ
    const manager = managers.get(msg.guildId);
    if (!manager) return;
    // 読み上げ対象のチャンネルでなければスキップ
    if (msg.channelId !== manager.chId) return;
    // 設定を取得
    const user = await UserEntity.get(msg.author.id);
    if (!user.isRead) return;
    const guild = await GuildEntity.get(msg.guildId);
    // 読み上げるための文字列
    let text = guild.readName ? `${msg.author.username} ${msg.content}` : msg.content;
    // いろいろ読み上げないようにする
    text = text.replace(/https?:\/\S*/g, "url");
    text = text.replace(/<(@[!&]?|#)\d+>/g, "メンション");
    text = text.replace(/(?<=<a?:\w+):\d+>|<a?:(?=\w+:\d+>)/g, ""); // 絵文字名は残し絵文字idを消す
    // 文字列を読み上げる
    await manager.speak(text, guild, user);
});