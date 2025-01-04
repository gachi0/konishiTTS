// import dict from "./dict";
// import guildSetting from "./guildSetting";
// import help, { setHelpComamands } from "./help";
import { ICommand } from "../service/types";
import join from "./join";
import leave from "./leave";
import skip from "./skip";
// import userSetting from "./userSetting";

const commandAry: ICommand[] = [
  // guildSetting,
  // help,
  join,
  leave,
  skip,
  // userSetting,
  // dict,

];

const commands = new Map(
  commandAry.map(c => [c.data.name, c])
);

// setHelpComamands(commands);

export default commands;