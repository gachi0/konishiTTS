import { ICommand } from "../../service/types";
import { db } from "../../lib/bot";
import { getOrCreate } from "../../service/db";
import { userSettingView } from "./func";
import { APIEmbedField, ApplicationCommandNumericOptionData, ApplicationCommandOptionChoiceData, ApplicationCommandOptionType } from "discord.js";
import { vvInfo } from "../../lib/voicevox";

const command = (): ICommand => ({
  data: {
    name: "user_setting",
    description: "Botのユーザー設定を変更/閲覧します。話すキャラクターはここで変更できます。",
    options: [
      {
        type: ApplicationCommandOptionType.Boolean,
        name: 'read_message',
        description: '自分のメッセージを読み上げるかどうか。読み上げる場合はTrueを、読み上げたくない場合はFalseを指定してください',
      },
      ...vvInfo.chunkedStyles
        .map<ApplicationCommandNumericOptionData>((page, i) => ({
          type: ApplicationCommandOptionType.Integer,
          name: `speaker${i}`,
          description: `設定可能な話者の${i + 1}ページ目です。ここに乗っていないキャラクターは他のページを探してください。`,
          choices: page.map<ApplicationCommandOptionChoiceData<number>>(s => ({
            name: s[1],
            value: s[0],
          }))
        })),
    ]
  },
  async execute(intr) {
    const uid = intr.user.id;
    const dbUser = await db.kUser.upsert(getOrCreate(uid));
    const isRead = intr.options.getBoolean('read_message') ?? undefined;

    // 最初の非null値探索
    const speaker = vvInfo.chunkedStyles
      .map((_, i) => intr.options.getInteger(`speaker${i}`))
      .find(v => v != null);

    // DB値更新
    await db.kUser.update({
      where: { id: uid },
      data: { speaker, isRead },
    });

    const fields: APIEmbedField[] = [
      ...(
        isRead !== undefined ? [{
          name: '読み上げオプション',
          value: `**${dbUser.isRead}** から **${isRead}** に変更しました。`,
        }] : []
      ),
      ...(
        speaker !== undefined ? [{
          name: 'キャラクター(スタイル)',
          value: `**${vvInfo.styleMap.get(dbUser.speaker)}** から **${vvInfo.styleMap.get(speaker)}** に変更しました。`,
        }] : []
      ),
    ];

    await intr.reply({
      embeds: fields.length === 0
        ? [userSettingView(dbUser)]
        : [{ fields }],
    });
  }
});

export default command;
