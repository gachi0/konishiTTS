import { spawn } from "child_process";
import { botInit, client, config } from "./bot";



const main = async () => {
  // 初期化処理
  await botInit();
  // botにログイン
  await client.login(config.token);
};

main().catch(e => {
  console.error(e);
  console.log("エンターキーを押すと終了します。");
  process.stdin.resume();
  process.stdin.on("data", () => process.exit(0));
});