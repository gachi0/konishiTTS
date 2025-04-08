// import dict from "./dict";
// import guildSetting from "./guildSetting";
import { execute } from "./help/help";
import { ICommand } from "../service/types";
import join from "./join";
import leave from "./leave";
import skip from "./skip";
import { ApplicationCommandType } from "discord.js";

import userSetting from "./settings/user";

export const commandAry: ICommand[] = [
  // guildSetting,
  // help,
  join,
  leave,
  skip,
  {
    data: {
      name: "help",
      description: "helpelpeeepee",
      type: ApplicationCommandType.ChatInput,
    },
    async execute(intr) { execute(intr); },
  },
  userSetting,
  // dict,

];

const commands = new Map(
  commandAry.map(c => [c.data.name, c])
);

// setHelpComamands(commands);

export default commands;