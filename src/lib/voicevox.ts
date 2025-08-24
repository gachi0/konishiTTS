import { spawn } from "child_process";
import { env } from "./env";
import { components, paths } from "../openapi/schema";
import createClient from "openapi-fetch";

class VoiceVoxInfomator {
  /** 省略時に追加される音声のクエリ */
  skipStrQuery: components['schemas']['AccentPhrase'][] = [];

  /** バージョン */
  version?: string;

  /** スピーカーの情報 */
  speakers: components['schemas']['Speaker'][] = [];

  private speakerIdStyle = new Map<number, string>();
  public idToStyleName(id: number): string | undefined {
    return this.speakerIdStyle.get(id);
  }

  public async init() {
    console.log('VOICEVOX INFO FETCH...');
    this.version = await this.isEngineRunning();
    if (!this.version) {
      await this.runEngine();
      this.version = await this.isEngineRunning();
    }

    await this.setSpeakers();
    this.skipStrQuery = await this.getSkipStrQuery();
  }

  private async setSpeakers() {
    const { data, error } = await voicevox.GET('/speakers');
    if (!data) throw new Error(error.toString());

    this.speakers = data;
    this.speakerIdStyle = new Map(
      data.flatMap(speaker => speaker.styles.map(
        style => [style.id, `${speaker.name}(${style.name})`]),
      )
    );
  }

  private async getSkipStrQuery() {
    const { data, error } = await voicevox.POST('/accent_phrases',
      { params: { query: { speaker: 1, text: "以下略" } } }
    );
    if (!data) throw new Error(error.toString());
    return data;
  }

  private async isEngineRunning() {
    try {
      const { data } = await voicevox.GET('/version');
      return data;
    } catch (error) {
      console.log('バージョン情報が取得できず。');
    }

  }

  private async runEngine() {
    const vvProc = spawn(env.ENGINE_PATH);
    vvProc.stdout?.on("data", d => console.log(d.toString()));
    return await new Promise<true | Error>(rs => {
      vvProc.on("close", c => rs(new Error(`エンジンがコード${c}で終了しました。`)));
      vvProc.on("error", e => rs(e));
      vvProc.stderr?.on("data", (b: Buffer) => {
        const txt = b.toString();
        console.log(txt);
        if (txt.match(/^INFO:\s+Uvicorn running on/)) {
          console.log("エンジンを起動しました");
          rs(true);
        }
      });
    });
  }
}

/** VOICEVOXクライアント */
export let voicevox = createClient<paths>({ baseUrl: env.ENGINE_API_URL });

/** ヴォイスヴォックス情報シングルちんインスタンス */
export const vvInfo = new VoiceVoxInfomator();
