import { allImport, client, IEvent, config } from "./bot";
import { DBInit } from "./db";

+ async function () {
    // DB初期化
    await DBInit();
    // イベント登録
    for (const e of await allImport("events") as IEvent[]) {
        client[e.once ? "once" : "on"](e.name, (...args) =>
            e.execute(...args).catch(console.error));
    }
    // botにログイン
    await client.login(config.token);
}();