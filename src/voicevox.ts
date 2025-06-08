import { spawn } from "child_process";
import { enginePath, engineUrl } from "../env";
import { components, operations, paths } from "./openapi/schema";
import createClient from "openapi-fetch";

class VoiceVoxInfomator {
  /** 省略時に追加される音声のクエリ */
  skipStrQuery: components['schemas']['AccentPhrase'][] = [];

  /** バージョン */
  version: string = 'fetching version';

  /** スピーカーの情報 */
  speakers: components['schemas']['Speaker'][] = [];

  private speakerIdStyle = new Map<number, string>();

  idToStyleName(id: number): string | undefined {
    return this.speakerIdStyle.get(id);
  }

  async fetches() {
    const running = await this.isEngineRunning();
    if (!running) await this.runEngine();

    await this.setSpeakers();
    await this.setSkipStrQuery();
  }

  private async setSpeakers() {
    const { data, error } = await voicevox.GET('/speakers');
    if (!data) throw new Error(error.toString());

    this.speakers = data;
    this.speakerIdStyle = new Map(
      data.flatMap(speaker => speaker.styles.map(style =>
        [style.id, `${speaker.name}(${style.name})`]
      ))
    );
  }

  private async setSkipStrQuery() {
    const { data, error } = await voicevox.POST('/accent_phrases',
      { params: { query: { speaker: 1, text: "以下略" } } }
    );
    if (!data) throw new Error(error.toString());
    this.skipStrQuery = data;
  }

  private async isEngineRunning() {
    const FAIL = "Failed to GET";
    try {
      const { data } = await voicevox.GET('/version');
      this.version = data ?? FAIL;
      return true;
    } catch {
      this.version = FAIL;
      return false;
    }
  };

  private async runEngine() {
    const vvProc = spawn(enginePath);
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
export let voicevox = createClient<paths>({ baseUrl: engineUrl });

/** ヴォイスヴォックス情報シングルちんインスタンス */
export const vvInfo = new VoiceVoxInfomator();