import { config, clienton, botInit, client } from "./bot";
import commands from "./commands";

clienton("ready", async client => {
    const commandData = [...commands.values()].map(c => c.data.toJSON());
    if (process.argv[2] === "guild") {
        const guild = await client.guilds.fetch(config.guildId);
        await guild.commands.set(commandData);
        console.log(`${config.guildId}にコマンドを登録しました！`);
    }
    else if (process.argv[2] === "app") {
        await client.application.commands.set(commandData);
        console.log("コマンドを登録しました！");
    }
    else if (process.argv[2] === "clearguild") {
        const guild = await client.guilds.fetch(config.guildId);
        await guild.commands.set([]);
        console.log(`${config.guildId}からコマンドを削除しました！`);
    }
    else if (process.argv[2] === "clearapp") {
        await client.application.commands.set([]);
        console.log("コマンドを削除しました！（反映には数時間かかります）");
    }
    else throw Error(`不正な引数: ${process.argv[2]}`);
    client.destroy();
}, true);

(async () => {
    await botInit();
    await client.login(config.token);
})();