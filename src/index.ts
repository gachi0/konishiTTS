import { botInit, client, config } from "./bot";
import { DBInit } from "./db";

const main = async () => {
    // 初期化処理
    await DBInit();
    await botInit();
    // イベント登録
    await import("./events");
    // botにログイン
    await client.login(config.token);
};

main().catch(e => {
    console.error(e);
    console.log("エンターキーを押すと終了します。");
    process.stdin.resume();
    process.stdin.on("data", () => process.exit(0));
});