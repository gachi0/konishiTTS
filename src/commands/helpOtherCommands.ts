import { ICommand } from "../bot";
import guildMaxChar from "./guildMaxChar";
import guildReadName from "./guildReadName";
import guildSetting from "./guildSettings";
import guildSpeed from "./guildSpeed";
import join from "./join";
import leave from "./leave";
import skip from "./skip";
import userIsRead from "./userIsRead";
import userSettings from "./userSettings";
import userSpeaker from "./userSpeaker";

const commandToEntries = (c: ICommand): [string, ICommand] => [c.data.name, c];

/** helpコマンド以外のコマンド(help.tsとの相互import対策) */
export default new Map([
    guildMaxChar, guildReadName, guildSetting, guildSpeed, join,
    leave, skip, userIsRead, userSettings, userSpeaker
].map(commandToEntries));