import { KWord } from "@prisma/client";
import { ActionRowBuilder, APIEmbed, APIEmbedField, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { chunk } from "remeda";

export const CUSTOMID_DICT_ADD_BTN = 'KONISHITTS-DICT-ADD-BUTTON';
export const CUSTOMID_DICT_ADD_MODAL = 'KONISHITTS-DICT-ADD-MODAL';
export const CUSTOMID_DICT_ADD_MODAL_WORD = 'KONISHITTS-DICT-ADD-MODAL-WORD';
export const CUSTOMID_DICT_ADD_MODAL_YOMI = 'KONISHITTS-DICT-ADD-MODAL-YOMI';

export const CUSTOMID_DICT_DEL_BTN = 'KONISHITTS-DICT-DELETE-BUTTON';
export const CUSTOMID_DICT_DEL_MODAL = 'KONISHITTS-DICT-DELETE-MODAL';
export const CUSTOMID_DICT_DEL_MODAL_ID = 'KONISHITTS-DICT-DELETE-MODAL-ID';

export const dictEmbeds = (dict: KWord[]): APIEmbed[] => {
  const chunked = chunk(dict, 25);
  return chunked.map((words, page) => ({
    title: (`登録された単語一覧(${page + 1}/${chunked.length})`),
    fields: words.map<APIEmbedField>(w => ({
      name: `${w.id}`,
      value: `**${w.yomi}** -> **${w.word}**`,
      inline: true,
    }))
  }));
};

export const DICT_MESSAGE_BUTTONS = new ActionRowBuilder<ButtonBuilder>({
  components: [
    new ButtonBuilder({
      label: '追加',
      style: ButtonStyle.Primary,
      customId: CUSTOMID_DICT_ADD_BTN,
      emoji: { name: '\u{2795}' }, // + .
    }),
    new ButtonBuilder({
      label: '削除',
      style: ButtonStyle.Danger,
      customId: CUSTOMID_DICT_DEL_BTN,
      emoji: { name: '\u{1F5D1}' }, // ゴミ箱.
    }),
  ],
});

const DICT_ADD_MODAL_FIELDS = [
  new TextInputBuilder({
    label: '読ませたい単語',
    customId: CUSTOMID_DICT_ADD_MODAL_WORD,
    style: TextInputStyle.Short,
    required: true,
    minLength: 1, maxLength: 50,
  }),
  new TextInputBuilder({
    label: '読み方',
    customId: CUSTOMID_DICT_ADD_MODAL_YOMI,
    style: TextInputStyle.Short,
    required: true,
    maxLength: 50,
  }),
];

export const DICT_ADD_MODAL = new ModalBuilder({
  title: '登録したい単語を入力してください。',
  customId: CUSTOMID_DICT_ADD_MODAL,
  components: DICT_ADD_MODAL_FIELDS.map(t =>
    new ActionRowBuilder<TextInputBuilder>({ components: [t] }),
  ),
});

export const DICT_REMOVE_MODAL = new ModalBuilder({
  title: '削除する単語のIDを入力してください。',
  customId: CUSTOMID_DICT_DEL_MODAL,
  components: [
    new ActionRowBuilder<TextInputBuilder>({
      components: [
        new TextInputBuilder({
          label: '削除する単語のID',
          customId: CUSTOMID_DICT_DEL_MODAL_ID,
          style: TextInputStyle.Short,
          required: true,
        }),
      ]
    }),
  ],
});
