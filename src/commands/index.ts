
import { ICommand, IRawCommand } from "../service/types";
import join from "./join";
import leave from "./leave";
import skip from "./skip";
import speaker from "./speaker";
import userSetting from "./settings/user";

const commands = new Map<string, ICommand>();

/** 実行時にVVInfoとかのあとに実行させてね */
export const setCommands = () => {

  const beforeCmds: IRawCommand[] = [
    // help,
    join,
    leave,
    skip,
    speaker,
    userSetting,
  ];

  for (const c of beforeCmds) {
    const data = typeof c.data === 'function'
      ? c.data()
      : c.data;

    console.log(data);
    const parsed = { ...c, data };

    commands.set(data.name, parsed);
  }
};

export default commands;