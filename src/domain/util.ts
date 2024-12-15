import { ClientEvents, SlashCommandOptionsOnlyBuilder } from "discord.js";
import { client, speakersInfo } from "../bot";

/** listenerの例外をcatchしてイベント登録 */
export const clienton = <K extends keyof ClientEvents>(
    name: K,
    listener: (...args: ClientEvents[K]) => Promise<void>,
    once = false
) => {
    client[once ? "once" : "on"](name, (...args) =>
        listener(...args).catch(console.error));
};

/** コマンドにSpeakerを変更するオプションを追加 */
export const addSpeakerOption = (cmd: SlashCommandOptionsOnlyBuilder) => {
    for (let i = 0; i < Math.ceil(speakersInfo.size / 25); i++) {
        cmd.addIntegerOption(o => o
            .setName(`speaker${i + 1}`)
            .setDescription(`喋る人(${i + 1}ページ目)`)
            .addChoices(...[...speakersInfo]
                .slice(i * 25, (i + 1) * 25)
                .map(s => ({ name: s[1], value: s[0] }))));
    }
    return cmd;
};
