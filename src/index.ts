import { token } from "../env";
import { client } from "./bot";
import { setCommands } from "./commands";
import error from "./events/error";
import interaction from "./events/interaction";
import message from "./events/message";
import ready from "./events/ready";
import vcUpdate from "./events/vcUpdate";
import { vvInfo } from "./voicevox";

const main = async () => {
  console.log("running...");
  await vvInfo.fetches();
  setCommands();

  [
    error, interaction, message, ready, vcUpdate
  ].map(c => c(client));

  await client.login(token);
};

main().catch(e => {
  console.error(e);
  console.log("エンターキーを押すと終了します。");
  process.stdin.resume();
  process.stdin.on("data", () => process.exit(0));
});