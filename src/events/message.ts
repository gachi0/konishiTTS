import { createAudioResource } from "@discordjs/voice";
import { Message } from "discord.js";
import { config, IEvent, managers } from "../bot";
import { Readable } from "stream";
import axios from "axios";

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
        // 50文字以上の場合スキップ
        if (50 < msg.content.length) return;

        // 音声合成
        const query = await axios.post(`${config.engineUrl}/audio_query?text=${encodeURI(msg.content)}&speaker=${0}`);
        query.data.speedScale = 1;
        const wav = (await axios.post(`${config.engineUrl}/synthesis?speaker=${0}`, query.data, {
            responseType: "arraybuffer"
        }));
        const resource = createAudioResource(Readable.from(wav.data));
        manager.queue.push(resource);
        if (!manager.isPlaying) {
            await manager.play();
        }
    };
};