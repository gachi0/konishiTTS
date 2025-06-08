import { AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, VoiceConnection } from "@discordjs/voice";
import { Readable } from "stream";
import { KGuild, KUser } from "@prisma/client";
import { voicevox } from "../voicevox";

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
    } else if (2 <= count) {
      this.queue = this.queue.slice(count - 1);
    }
    this.player.stop();
  }

  /** textを読み上げる */
  async speak(text: string, guild: KGuild, user: KUser) {

    const speaker = user?.speaker ?? guild.speaker;

    // 音声合成用のクエリを生成
    const audioQuery = await voicevox.POST('/audio_query', {
      params: {
        query: { speaker, text }
      }
    });

    if (!audioQuery.data) {
      console.log(audioQuery.error);
      return;
    }

    // 音声合成
    const synth = await voicevox.POST(`/synthesis`, {
      body: audioQuery.data,
      params: { query: { speaker } },
      parseAs: "arrayBuffer",
    });

    if (!synth.data) return;

    const buffer = Buffer.from(synth.data);
    const readable = Readable.from([buffer]);
    const resource = createAudioResource(readable);

    await this.play(resource);
  }

  constructor(chId: string, conn: VoiceConnection) {
    this.conn = conn;
    this.chId = chId;
  }
}

