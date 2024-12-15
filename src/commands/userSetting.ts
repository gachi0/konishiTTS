import { ICommand, speakersInfo } from "../bot";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { UserEntity } from "../db";
import { addSpeakerOption } from "../domain/util";

let data = new SlashCommandBuilder()
  .setName("user_setting")
  .addBooleanOption(o => o
    .setName("read_message")
    .setDescription("自分のメッセージを読み上げるかどうか。読み上げる場合はTrueを、読み上げたくない場合はFalseを指定してください"))
  .setDescription("Botのユーザー設定を変更します。オプションなしで送信された場合、現在の設定の一覧を表示します。");
data = addSpeakerOption(data);

export default <ICommand>{
  data: data,
  execute: async intr => {

    const user = await UserEntity.get(intr.user.id);
    const nowSpeaker = `${speakersInfo.get(user.speaker ?? -1) ?? "設定なし"}`;
    const readMessage = intr.options.getBoolean("read_message");
    let speaker: number | null = null;

    for (let i = 1; i < Math.ceil(speakersInfo.size / 25) + 1; i++) {
      const s = intr.options.getInteger(`speaker${i}`);
      if (s) {
        speaker = s;
      }
    }

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