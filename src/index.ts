import { token } from "../env";
import { client, engineSetUp } from "./bot";
import error from "./events/error";
import interaction from "./events/interaction";
import message from "./events/message";
import ready from "./events/ready";
import vcUpdate from "./events/vcUpdate";

const main = async () => {
  console.log("started");

  [error, interaction, message, ready, vcUpdate]
    .map(c => c(client));
  await engineSetUp();
  await client.login(token);
};

main().catch(e => {
  console.error(e);
  console.log("エンターキーを押すと終了します。");
  process.stdin.resume();
  process.stdin.on("data", () => process.exit(0));
});