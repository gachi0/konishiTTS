
import { ICommand } from "../service/types";
import join from "./join";
import leave from "./leave";
import skip from "./skip";
import { genSpeakerCommand } from "./speaker";
import userSetting from "./settings/user";
import { genHelp } from "./help/help";

export const commands = new Map<string, ICommand>();

/** 実行時にVVInfoとかのあとに実行させてね */
export const setupCommands = (): Map<string, ICommand> => {

  [join, leave, skip]
    .forEach(c => commands.set(c.data.name, c));

  [genSpeakerCommand, userSetting]
    .forEach(getCmd => {
      const c = getCmd();
      commands.set(c.data.name, c);
    });

  const help = genHelp([...commands.values()]);
  commands.set(help.data.name, help);

  return commands;
};
