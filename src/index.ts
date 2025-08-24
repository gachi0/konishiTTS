import { env } from "./lib/env";
import { client } from "./lib/bot";
import { setCommands } from "./commands";
import error from "./events/error";
import interaction from "./events/interaction";
import message from "./events/message";
import ready from "./events/ready";
import vcUpdate from "./events/vcUpdate";
import { vvInfo } from "./lib/voicevox";

const main = async () => {
  console.log("running...");
  await vvInfo.init();
  setCommands();

  client
    .on(error.name, error.listener)
    .on(interaction.name, interaction.listener)
    .on(message.name, message.listener)
    .on(ready.name, ready.listener)
    .on(vcUpdate.name, vcUpdate.listener);


  await client.login(env.DISCORD_TOKEN);
};

main().catch(e => {
  console.error(e);
  console.log("エンターキーを押すと終了します。");
  process.stdin.resume();
  process.stdin.on("data", () => process.exit(0));
});