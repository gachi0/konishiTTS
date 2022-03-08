import { ICommand, speakersInfo } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
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
            .addChoices([...speakersInfo].map(s => [s[1], s[0]]))),

    execute: async intr => {

        const user = await UserEntity.get(intr.user.id);
        const nowSpeaker = `${speakersInfo.get(user.speaker ?? -1) ?? "設定なし"}`;
        const readMessage = intr.options.getBoolean("read_message");
        const speaker = intr.options.getInteger("speaker");

        // オプションが何も設定されていなかったら
        if ([readMessage, speaker].every(o => o === null)) {
            await intr.reply({
                embeds: [new MessageEmbed()
                    .setTitle(`${intr.user.username}の設定`)
                    .addField("読み上げ", user.isRead ? "ON" : "OFF")
                    .addField("声", nowSpeaker)
                ],
                ephemeral: true
            });
            return;
        }

        const embed = new MessageEmbed({ title: `${intr.user.username}の設定` });
        if (readMessage !== null) {
            embed.addField("読み上げ",
                `${user.isRead} から ${readMessage} に変更しました。`);
            user.isRead = readMessage;
        }
        if (speaker !== null) {
            embed.addField("喋る人",
                `${nowSpeaker} から ${speakersInfo.get(speaker)} に変更しました。`);
            user.speaker = speaker;
        }
        await UserEntity.repo.save(user);
        await intr.reply({ embeds: [embed], ephemeral: true });
    }
};