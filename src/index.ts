import { allImport, client, config, speakersInit } from "./bot";
import { DBInit } from "./db";

+ async function () {
    // DB初期化
    await DBInit();
    await speakersInit();
    // イベント登録
    await allImport("events");
    // botにログイン
    await client.login(config.token);
}();