import { ICommand } from "../bot";
import guildSetting from "./guildSetting";
import join from "./join";
import leave from "./leave";
import skip from "./skip";
import userSetting from "./userSetting";

/** helpコマンド以外のコマンド(help.tsとの相互import対策) */
export default new Map([
    guildSetting, join, leave, skip, userSetting
].map((c: ICommand): [string, ICommand] => [c.data.name, c]));