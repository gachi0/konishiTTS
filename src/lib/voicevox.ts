import { spawn } from "child_process";
import { env } from "./env";
import { components, paths } from "../openapi/schema";
import createClient from "openapi-fetch";
import { chunk } from "remeda";

export type VVSpeaker = components['schemas']['Speaker'];

export type VoicevoxInfoStore = {
  /** バージョン */
  version: string;
  /** スピーカーの情報 */
  speakers: VVSpeaker[];
  /** スタイルID -> スピーカースタイル名 */
  styleMap: Map<number, string>;
  /** スピーカースタイル名25分割 */
  chunkedStyles: [number, string][][];
  /** 省略時に追加される音声のクエリ */
  skipQuery: components['schemas']['AccentPhrase'][];
};


/** openapi-fetchのレスポンスからerror時に例外を投げるだけ */
const handleResponse = async <T>(
  responsePromise: Promise<{ data?: T; error?: unknown; }>
): Promise<T> => {
  const { data, error } = await responsePromise;

  if (error) {
    throw new Error(`API request failed ${error}`);
  }

  return data as T;
};

export class VoicevoxClient {
  private vv = createClient<paths>({
    baseUrl: env.ENGINE_API_URL,
  });

  public async init() {
    console.log('VOICEVOX INFO FETCH...');

    try {
      await this.vv.GET('/version');
    } catch (error) {
      await this.runEngine();
    }

  }

  public async audioQuery(
    speaker: number,
    text: string,
  ) {
    const audioQuery = await handleResponse(this.vv.POST('/audio_query', {
      params: { query: { speaker, text } }
    }));
    return audioQuery;
  }

  public async synth(
    speaker: number,
    body: components['schemas']['AudioQuery'],
  ) {
    const synth = await handleResponse(this.vv.POST(`/synthesis`, {
      body: body,
      params: { query: { speaker } },
      parseAs: "arrayBuffer",
    }));
    return synth;
  }

  public async speakerInfo(speaker_uuid: string) {
    const speakerData = await handleResponse(this.vv.GET('/speaker_info', {
      params: { query: { speaker_uuid } }
    }));
    return speakerData;
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

  public async fetchInfo(): Promise<VoicevoxInfoStore> {
    const version = await handleResponse(this.vv.GET('/version'));
    const speakers = await handleResponse(this.vv.GET('/speakers'));
    const { accent_phrases: skipQuery } = await this.audioQuery(1, '以下略');

    const styles = speakers.flatMap(speaker => speaker.styles.map<[number, string]>(
      style => [style.id, `${speaker.name}(${style.name})`],
    ));
    const styleMap = new Map(styles);
    const chunkedStyles = chunk(styles, 25);

    return { version, skipQuery, speakers, styleMap, chunkedStyles };
  }
}

/** ヴォイスヴォックス情報シングルちんインスタンス */
export const vvClient = new VoicevoxClient();

/** VOICEVOX起動時取得情報 */
export let vvInfo: VoicevoxInfoStore;

/** 起動時に実行しろ */
export const setupVvInfo = async () => {
  const vvinfo = await vvClient.fetchInfo();
  vvInfo = vvinfo;
  return vvinfo;
};
