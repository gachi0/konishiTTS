import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import { allImport, ICommand, config, speakersInit } from "./bot";
import { ClientUser } from "discord.js";
const rest = new REST({ version: "9" }).setToken(config.token);

+ async function () {
    await speakersInit();
    const clientId = (await rest.get(Routes.user("@me")) as ClientUser).id;
    if (process.argv[2] === "guild") {
        await rest.put(Routes.applicationGuildCommands(clientId, config.guildId), {
            body: (await allImport("commands") as ICommand[]).map(c => c.data.toJSON())
        });
        console.log(`${config.guildId}にコマンドを登録しました！`);
    }
    else if (process.argv[2] === "app") {
        await rest.put(Routes.applicationCommands(clientId), {
            body: (await allImport("commands") as ICommand[]).map(c => c.data.toJSON())
        });
        console.log("コマンドを登録しました！（反映には数時間かかります）");
    }
    else if (process.argv[2] === "clearguild") {
        await rest.put(Routes.applicationGuildCommands(clientId, config.guildId), { body: [] });
        console.log(`${config.guildId}からコマンドを削除しました！`);
    }
    else if (process.argv[2] === "clearapp") {
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log("コマンドを削除しました！（反映には数時間かかります）");
    }
    else throw Error(`不正な引数: ${process.argv[2]}`);
}();