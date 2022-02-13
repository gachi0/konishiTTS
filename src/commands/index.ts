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

export default new Map([
    guildMaxChar, guildReadName, guildSetting, guildSpeed, join, leave, skip, userIsRead, userSettings, userSpeaker
].map((c): [string, ICommand] => [c.data.name, c]));