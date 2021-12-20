import { createAudioResource } from "@discordjs/voice";
import { Message } from "discord.js";
import { config, IEvent, managers } from "../bot";
import { Readable } from "stream";
import axios from "axios";
import { GuildEntity, UserEntity } from "../db";

export default new class implements IEvent {
    name = "messageCreate";
    execute = async (msg: Message) => {
        if (msg.author.bot) return;
        if (!msg.guildId) return;
        // botが通話に参加してなければスキップ
        if (!managers[msg.guildId]) return;
        const manager = managers[msg.guildId];
        // 読み上げ対象のチャンネルでなければスキップ
        if (msg.channelId !== manager.chId) return;

        // 設定を取得
        const user = await UserEntity.get(msg.author.id);
        const guild = await GuildEntity.get(msg.guildId);

        // 読み上げるための文字列
        const content = guild.readName ? `${msg.author.username} ${msg.content}` : msg.content;

        // 音声合成用のクエリを生成
        const query = await axios.post(
            `${config.engineUrl}/audio_query?text=${encodeURI(content)}&speaker=${user.speaker ?? guild.speaker}`);

        // モーラ数が guild.maxChar を超えていたらスキップ
        let moras = 0;
        for (const i of query.data.accent_phrases) {
            moras += i.moras.length;
        }
        if (guild.maxChar < moras) return;

        // その他の設定を反映
        query.data.speedScale = guild.speed;
        query.data.pitchScale = user.pitch ?? guild.pitch;

        //音声合成
        const wav = await axios.post(`${config.engineUrl}/synthesis?speaker=${0}`, query.data, {
            responseType: "arraybuffer"
        });
        const resource = createAudioResource(Readable.from(wav.data));

        // 合成した音声を再生する
        await manager.play(resource);
    };
};