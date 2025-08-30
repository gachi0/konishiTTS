import { env } from "../lib/env";
import { client } from "../lib/bot";
import { commands, setupCommands } from "../commands";
import { createEvent } from "../service/types";
import { setupVvInfo, vvClient, vvInfo } from "../lib/voicevox";

/**
 * sample
 * npx tsx src/scripts/commands.ts guild 608000464524410900
 */

const [_0, _1, cmdName, guildId] = process.argv;

const ready = createEvent("clientReady", async client => {
  await vvClient.init();
  await setupVvInfo();
  setupCommands();

  const commandData = [...commands.values()].map(c => c.data);

  if (cmdName === "guild") {
    const guild = await client.guilds.fetch(guildId);
    await guild.commands.set([]);
    await guild.commands.set(commandData);
    console.log(`${guild.name}にコマンドを登録しました！`);
  }

  else if (cmdName === "app") {
    await client.application.commands.set(commandData);
    console.log("コマンドを登録しました！");
  }

  else if (cmdName === "clearguild") {
    const guild = await client.guilds.fetch(guildId);
    await guild.commands.set([]);
    console.log(`${guild.name}からコマンドを削除しました！`);
  }

  else if (cmdName === "clearapp") {
    await client.application.commands.set([]);
    console.log("コマンドを削除しました！（反映には数時間かかります）");
  }

  else {
    throw Error(`不正な引数: ${cmdName}`);
  }


});

(async () => {
  client.on(ready.name, ready.listener);
  await client.login(env.DISCORD_TOKEN);
})();

