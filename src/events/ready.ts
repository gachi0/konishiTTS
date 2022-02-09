import { clienton } from "../bot";
import commands from "../commands";

clienton("ready", async client => {
    console.log("ログイン完了！");
    const commandData = [...commands.values()].map(c => c.data.toJSON());
    await client.application.commands.set(commandData);
    console.log("コマンドを登録しました！（反映には数時間かかります）");
}, true);