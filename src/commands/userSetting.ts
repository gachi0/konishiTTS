// import { ICommand, speakersInfo } from "../bot";
import { ApplicationCommandOptionType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../service/types";
import { db, speakers } from "../bot";
import { upsertQuery } from "../service/db";
// import { UserEntity } from "../db";
// import { addSpeakerOption } from "../domain/util";

const command: ICommand = {
  data: {
    name: "user_setting",
    description: "Botのユーザー設定を変更します。オプションなしで送信された場合、現在の設定の一覧を表示します。",
    options: [
      {
        type: ApplicationCommandOptionType.Boolean,
        name: "read_message",
        description: "自分のメッセージを読み上げるかどうか。読み上げる場合はTrueを、読み上げたくない場合はFalseを指定してください",
      },
    ],
  },
  async execute(intr, _) {
    const user = await db.kUser.upsert(upsertQuery(intr.user.id));
    const nowSpeaker = `${speakers.get(user.speaker) ?? "設定なし"}`;
    const readMessage = intr.options.getBoolean("read_message");

    const speaker = Array.from(
      { length: Math.ceil(speakers.size / 25) },
      (_, i) => i + 1
    )
      .map(i => intr.options.getInteger(`speaker${i}`))
      .find(s => s !== null);

    // オプションが何も設定されていなかったら
    if ([readMessage, speaker].every(o => o === null)) {
      await intr.reply({
        ephemeral: true,
        embeds: [{
          title: `${intr.user.username}の設定`,
          fields: [
            { name: "読み上げ", value: user.isRead ? "ON" : "OFF" },
            { name: "声", value: nowSpeaker }
          ]
        }],
      });
      return;
    }


    const embed = new EmbedBuilder({ title: `${intr.user.username}の設定` });
    if (readMessage) {
      embed.addFields([{
        name: "読み上げ",
        value: `${user.isRead} から ${readMessage} に変更しました。`
      }]);
      user.isRead = readMessage;
    }
    if (speaker) {
      embed.addFields([{
        name: "喋る人",
        value: `${nowSpeaker} から ${speakers.get(speaker)} に変更しました。`
      }]);
      user.speaker = speaker;
    }

    await intr.reply({ embeds: [embed], ephemeral: true });
  },
};

export default command;