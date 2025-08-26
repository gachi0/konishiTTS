
import { ICommand } from "../service/types";
import join from "./join";
import leave from "./leave";
import skip from "./skip";
import speaker from "./speaker";
import userSetting from "./settings/user";

export const commands = new Map<string, ICommand>();

/** 実行時にVVInfoとかのあとに実行させてね */
export const setupCommands = (): Map<string, ICommand> => {

  [join, leave, skip]
    .forEach(c => commands.set(c.data.name, c));

  [speaker, userSetting]
    .forEach(getCmd => {
      const c = getCmd();
      commands.set(c.data.name, c);
    });

  return commands;
};
