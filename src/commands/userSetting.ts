import { ICommand, speakersInfo } from "../bot";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { UserEntity } from "../db";

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("user_setting")
        .setDescription("Botのユーザー設定を変更します。オプションなしで送信された場合、現在の設定の一覧を表示します。")
        .addBooleanOption(o => o
            .setName("read_message")
            .setDescription("自分のメッセージを読み上げるかどうか。読み上げる場合はTrueを、読み上げたくない場合はFalseを指定してください"))
        .addIntegerOption(o => o
            .setName("speaker")
            .setDescription("喋る人")
            .addChoices(...[...speakersInfo].map(s => ({ name: s[1], value: s[0] })))),

    execute: async intr => {

        const user = await UserEntity.get(intr.user.id);
        const nowSpeaker = `${speakersInfo.get(user.speaker ?? -1) ?? "設定なし"}`;
        const readMessage = intr.options.getBoolean("read_message");
        const speaker = intr.options.getInteger("speaker");

        // オプションが何も設定されていなかったら
        if ([readMessage, speaker].every(o => o === null)) {
            await intr.reply({
                embeds: [{
                    title: `${intr.user.username}の設定`,
                    fields: [
                        { name: "読み上げ", value: user.isRead ? "ON" : "OFF" },
                        { name: "声", value: nowSpeaker }
                    ]
                }],
                ephemeral: true
            });
            0;
            return;
        }


        const embed = new EmbedBuilder({ title: `${intr.user.username}の設定` });
        if (readMessage !== null) {
            embed.addFields([{
                name: "読み上げ",
                value: `${user.isRead} から ${readMessage} に変更しました。`
            }]);
            user.isRead = readMessage;
        }
        if (speaker !== null) {
            embed.addFields([{
                name: "喋る人",
                value: `${nowSpeaker} から ${speakersInfo.get(speaker)} に変更しました。`
            }]);
            user.speaker = speaker;
        }
        await UserEntity.repo.save(user);
        await intr.reply({ embeds: [embed], ephemeral: true });
    }
};