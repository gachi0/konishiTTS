import { ICommand } from "../bot";
import guildSetting from "./guildSetting";
import help, { setHelpComamands } from "./help";
import join from "./join";
import leave from "./leave";
import skip from "./skip";
import userSetting from "./userSetting";

const commands = new Map([
    guildSetting, help, join, leave, skip, userSetting
].map((c: ICommand) => [c.data.name, c]));

setHelpComamands(commands);

export default commands;