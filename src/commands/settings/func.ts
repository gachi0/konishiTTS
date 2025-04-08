import { KUser } from "@prisma/client";
import { ActionRowData, APIEmbed, codeBlock, ComponentType, inlineCode, InteractionResponse, MessageActionRowComponentData } from "discord.js";
import { vvInfo } from "../../voicevox";
import { createSettingOption } from "./types";
import dedent from "dedent";

const cso = createSettingOption<KUser>();

export const USER_SETTING_INFO = [
  cso("isRead", {
    label: 'メッセージの読み上げ',
    description: 'メッセージを読み上げるかどうか？',
    showText: m => m.isRead ? "読み上げる" : "読み上げない",
  }),
  cso("speaker", {
    label: 'キャラクター (スタイル)',
    description: '喋る人',
    showText: m => vvInfo.idToStyleName(m.speaker) ?? '設定なし',
  }),
];


export const USER_SETTING_SELECT_ACTION_ID = 'USER_SETTING_SELECT_ACTION_ID';
export const USER_SETTING_COMPONENT: ActionRowData<MessageActionRowComponentData> = {
  type: ComponentType.ActionRow,
  components: [
    {
      type: ComponentType.StringSelect,
      placeholder: '変更したい設定を選択してください。',
      disabled: true,
      customId: USER_SETTING_SELECT_ACTION_ID,
      options: USER_SETTING_INFO.map(o => ({
        label: o.label,
        value: o.field,
        description: o.description,
      })),
    },
  ]
};

/** 個別userの設定表示 */
export const userSettingView = (user: KUser): APIEmbed => ({
  title: "設定を 表示 or 編集 できます。",
  fields: USER_SETTING_INFO.map(o => ({
    name: o.label,
    value: inlineCode(o.showText(user)),
  }))
});


export const awaitUserSettingOptionSelect = async (
  userid: string,
  ir: InteractionResponse
) => {
  const iamc = await ir.awaitMessageComponent<ComponentType.StringSelect>({
    filter: (i) => i.user.id === userid,
    time: 900000,
  });
  console.log(iamc.values);
  await iamc.reply(JSON.stringify(iamc.values));
};