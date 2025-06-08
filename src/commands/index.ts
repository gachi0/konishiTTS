
import { ICommand, INotParsedCommand } from "../service/types";
import join from "./join";
import leave from "./leave";
import skip from "./skip";
import speakers from "./speakers";
import speaker from "./speaker";
import userSetting from "./settings/user";

const beforeCmds: INotParsedCommand[] = [
  // help,
  join,
  leave,
  skip,
  speakers,
  speaker,
  userSetting,
];

export const commandAry: ICommand[] = [];

const commands = new Map<string, ICommand>();

/** 実行時にVVInfoとかのあとに実行させてね */
export const setCommands = () => {
  for (const c of beforeCmds) {
    const data = typeof c.data === 'function'
      ? c.data()
      : c.data;

    console.log(data);

    const parsed = { ...c, data };

    commandAry.push(parsed);
    commands.set(data.name, parsed);
  }
};

export default commands;