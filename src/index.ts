import { allImport, botInit, client, config } from "./bot";
import { DBInit } from "./db";

+ async function () {
    // 初期化処理
    await DBInit();
    await botInit();
    // イベント登録
    await allImport("events");
    // botにログイン
    await client.login(config.token);
}();