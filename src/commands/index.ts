
import { ICommand } from "../service/types";
import join from "./join";
import { dictCommand } from "./dict/index";
import leave from "./leave";
import skip from "./skip";
import { genSpeakerCommand } from "./speaker";
import userSetting from "./settings/user";
import { genHelp } from "./help/help";
import { VoicevoxInfoStore } from "../lib/voicevox";
import { pipe } from "remeda";

export const commands = new Map<string, ICommand>();

/** 実行時にVVInfoとかのあとに実行させてね */
export const setupCommands = (vvInfo: VoicevoxInfoStore): Map<string, ICommand> => {

  // 単純なコマンド
  [join, leave, skip, dictCommand]
    .forEach(c => commands.set(c.data.name, c));

  // VoiceVoxの起動時データが必要なコマンド
  [genSpeakerCommand, userSetting]
    .forEach(getCmd => {
      const c = getCmd(vvInfo);
      commands.set(c.data.name, c);
    });

  const commandsAry = [...commands.values()];
  const helpCommand = pipe(
    genHelp(commandsAry), // まずhelpコマンド以外のhelpコマンドのメタデータを作成。
    help => genHelp([help, ...commandsAry]), // 次にhelpコマンドを含むcommandsでhelpコマンドのメタデータを上書き。 (helpにhelp追加)
    help => genHelp([help, ...commandsAry]), // 最後にhelpコマンド自体も含むhelpコマンドのメタデータも入ったcommandsでhelpコマンドのメタデータをで上書き。 (helpコマンドで表示されるhelpコマンドhelpにhelpコマンドのオプションを追加)
  );

  commands.set(helpCommand.data.name, helpCommand);

  return commands;
};
