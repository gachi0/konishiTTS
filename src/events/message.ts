import { Message } from "discord.js";
import { IEvent, managers } from "../bot";
import { GuildEntity, UserEntity } from "../db";

export default new class implements IEvent {
    name = "messageCreate";
    execute = async (msg: Message) => {
        if (msg.author.bot) return;
        if (!msg.guildId) return;
        
        // botが通話に参加してなければスキップ
        const manager = managers[msg.guildId];
        if (!manager) return;
        // 読み上げ対象のチャンネルでなければスキップ
        if (msg.channelId !== manager.chId) return;
        // 設定を取得
        const user = await UserEntity.get(msg.author.id);
        const guild = await GuildEntity.get(msg.guildId);
        // 読み上げるための文字列
        let text = guild.readName ? `${msg.author.username} ${msg.content}` : msg.content;
        // URLを読み上げないようにする
        text = text.replace(/https?:\/\S*/g, "url")
        // "#"が入っているとエラーになる
            .replace(/#/g, "");
        // 文字列を読み上げる
        manager.speak(text, guild, user);
    };
};