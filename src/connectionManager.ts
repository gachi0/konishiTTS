import { AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, VoiceConnection } from "@discordjs/voice";
import { GuildEntity, UserEntity } from "./db";
import { Readable } from "stream";
import { skipStrQuery, voicevox } from "./bot";

export default class ConnectionManager {
    private player = createAudioPlayer();
    /** 再生待ちの音声たち */
    private queue: AudioResource[] = [];
    /** 読み上げるボイスチャンネルのid */
    chId;
    /** Botの接続 */
    conn;
    /** 再生中かどうか */
    private isPlaying = false;

    /** 再生開始 */
    private async start() {
        this.isPlaying = true;
        // queueが空になるまで読み上げる
        while (this.queue[0]) {
            // queueの先頭の音声を再生
            this.player.play(this.queue[0]);
            this.conn.subscribe(this.player);
            // 再生が終了するまで待機
            await entersState(this.player, AudioPlayerStatus.Idle, 100000);
            // 再生済の音声を削除
            this.queue.shift();
        }
        this.isPlaying = false;
    }

    /** queueに音声を追加する。再生中でなければ再生を開始する */
    async play(resource: AudioResource) {
        this.queue.push(resource);
        if (!this.isPlaying) {
            await this.start();
        }
    }

    /** 現在読み上げ中の音声をスキップする */
    skip(count = 1) {
        if (count < 1) {
            return;
        }
        if (2 <= count) {
            this.queue = this.queue.slice(count - 1);
        }
        this.player.stop();
    }

    /** textを読み上げる */
    async speak(text: string, guild: GuildEntity, user?: UserEntity) {
        // 音声合成用のクエリを生成
        const query = await voicevox.post(
            `/audio_query?text=${encodeURIComponent(text)}&speaker=${user?.speaker ?? guild.speaker}`);

        let cnt = 0;
        const resultPhrases = [];
        for (const phrase of query.data.accent_phrases) {
            const resultPhrase = { ...phrase, moras: [] };
            for (const mora of phrase.moras) {
                resultPhrase.moras.push(mora);
                cnt++;
                // モーラ数がguild.maxCharを超えていたら止める
                if (guild.maxChar < cnt) {
                    resultPhrases.push(resultPhrase);
                    resultPhrases.push(...skipStrQuery);
                    break;
                }
            }
            cnt += phrase.pause_mora ? 1 : 0;
            if (guild.maxChar < cnt) break;
            // 超えていなければ現在のphraseを追加する
            resultPhrases.push(resultPhrase);
        }
        query.data.accent_phrases = resultPhrases;

        // その他の設定を反映
        query.data.speedScale = guild.speed;
        query.data.volumeScale = 1.3;

        //音声合成
        const wav = await voicevox.post(`/synthesis?speaker=${user?.speaker ?? guild.speaker}`, query.data, {
            responseType: "arraybuffer"
        });
        const resource = createAudioResource(Readable.from(wav.data));
        await this.play(resource);
    }

    constructor(chId: string, conn: VoiceConnection) {
        this.conn = conn;
        this.chId = chId;
    }
}
