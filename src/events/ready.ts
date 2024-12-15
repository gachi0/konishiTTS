import { ActivityType } from "discord.js";
import commands from "../commands";
import { clienton } from "../domain/util";

clienton("ready", async client => {
  console.log("ログイン完了！");
  const commandData = [...commands.values()].map(c => c.data.toJSON());
  await client.application.commands.set(commandData);
  console.log("コマンドを登録しました！（反映には数時間かかります）");
  await client.user.setActivity("/helpで使い方を表示！ /joinで読み上げ開始！", { type: ActivityType.Competing });
}, true);