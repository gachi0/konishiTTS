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
    if (![manager.chId, manager.conn.joinConfig.channelId].includes(msg.channelId)) return;
    // 設定を取得
    const user = await UserEntity.get(msg.author.id);
    if (!user.isRead) return;
    const guild = await GuildEntity.get(msg.guildId, true);
    // 読み上げるための文字列
    let text = msg.content;

    // バックスラッシュを辞書に登録するとバグる
    // 辞書を置換 
    // textから"{}"を削除する
    text = text.replace(/[{}]/g, "");
    for (const dict of guild.dict) {
        // 一度置換した文字列が2回以上置換されないように一時的に{}で囲う
        text = text.replace(
            new RegExp(`(?<!{)${dict.word}(?!})`, "g"),
            `{${dict.yomi}}`
        );
    }
    // "{}"を消す
    text = text.replace(/[{}]/g, "");

    // readNameがtrueだったら名前をtextに追加
    text = guild.readName ? `${msg.author.username} ${text}` : text;
    // ファイルが送られてきていたらファイルの件数を読み上げ
    text += msg.attachments.size ? `${msg.attachments.size}件のファイル` : "";
    // いろいろ読み上げないようにする
    text = text.replace(/https?:\/\S*/g, "url");
    text = text.replace(/<(@[!&]?|#)\d+>/g, "メンション");
    text = text.replace(/(?<=<a?:\w+):\d+>|<a?:(?=\w+:\d+>)/g, ""); // 絵文字名は残し絵文字idを消す
    // 文字列を読み上げる
    await manager.speak(text, guild, user);
});
