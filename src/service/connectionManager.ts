import { AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, VoiceConnection } from "@discordjs/voice";
import { Readable } from "stream";
import { vvClient } from "../lib/voicevox";

export default class ConnectionManager {
  private player = createAudioPlayer();
  /** 再生待ちの音声たち */
  private queue: AudioResource[] = [];
  /** 再生中かどうか */
  private isPlaying = false;

  constructor(
    /** 読み上げるボイスチャンネルのid */
    readonly chId: string,
    /** Botの接続 */
    readonly conn: VoiceConnection,
  ) { }

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
  async speak(text: string, speaker: number) {
    const query = await vvClient.audioQuery(speaker, text);
    const ab = await vvClient.synth(speaker, query);

    const buffer = Buffer.from(ab);
    const readable = Readable.from([buffer]);
    const resource = createAudioResource(readable);

    await this.play(resource);
  }
}

