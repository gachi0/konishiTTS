import { commandRegistGuildId, token } from "../env";
import { client } from "./bot";
import commands, { commandAry, setCommands } from "./commands";
import { createEvent } from "./service/types";
import { vvInfo } from "./voicevox";


const ready = createEvent("ready", async client => {
  await vvInfo.fetches();
  setCommands();
  const commandData = commandAry.map(c => c.data);

  if (process.argv[2] === "guild") {
    const guild = await client.guilds.fetch(commandRegistGuildId);
    await guild.commands.set(commandData);
    console.log(`${commandRegistGuildId}にコマンドを登録しました！`);
  }
  else if (process.argv[2] === "app") {
    await client.application.commands.set(commandData);
    console.log("コマンドを登録しました！");
  }
  else if (process.argv[2] === "clearguild") {
    const guild = await client.guilds.fetch(commandRegistGuildId);
    await guild.commands.set([]);
    console.log(`${commandRegistGuildId}からコマンドを削除しました！`);
  }
  else if (process.argv[2] === "clearapp") {
    await client.application.commands.set([]);
    console.log("コマンドを削除しました！（反映には数時間かかります）");
  }
  else {
    throw Error(`不正な引数: ${process.argv[2]}`);
  }

  client.destroy();
});

(async () => {
  ready(client);
  await client.login(token);
})();

