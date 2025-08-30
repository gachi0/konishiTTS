
import { ICommand } from "../service/types";
import join from "./join";
import leave from "./leave";
import skip from "./skip";
import { genSpeakerCommand } from "./speaker";
import userSetting from "./settings/user";
import { genHelp } from "./help/help";
import { vvInfo } from "../lib/voicevox";

export const commands = new Map<string, ICommand>();

/** 実行時にVVInfoとかのあとに実行させてね */
export const setupCommands = (): Map<string, ICommand> => {

  // 単純なコマンド
  [join, leave, skip]
    .forEach(c => commands.set(c.data.name, c));

  // VoiceVoxの起動時データが必要なコマンド
  [genSpeakerCommand, userSetting]
    .forEach(getCmd => {
      const c = getCmd(vvInfo);
      commands.set(c.data.name, c);
    });

  // helpコマンド以外のhelpコマンドのメタデータを作成。
  const beforeHelpCmd = genHelp([...commands.values()]);
  // helpコマンドのメタデータも入ったcommandsでhelpコマンド自体も含むhelpコマンドのメタデータを上書き。
  const fullHelpCmd = genHelp([beforeHelpCmd, ...commands.values()]);
  commands.set(fullHelpCmd.data.name, fullHelpCmd);

  return commands;
};
