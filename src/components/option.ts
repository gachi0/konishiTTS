import { ApplicationCommandNumericOptionData, ApplicationCommandOptionType } from "discord.js";
import { chunk } from "remeda";


/** コマンドにSpeakerを変更するオプションを追加 */
export const speakerOption = (
  speakers: Map<number, string>
): ApplicationCommandNumericOptionData[] =>
  chunk([...speakers], 25).map(speakerOptionPage);


/** 1ページ */
export const speakerOptionPage = (
  speakers: [number, string][], page: number
): ApplicationCommandNumericOptionData => ({
  type: ApplicationCommandOptionType.Integer,
  name: `speaker${page}`,
  description: `喋る人(${page}ページ目)`,
  choices: speakers.map(s => ({ name: s[1], value: s[0] })),
});
