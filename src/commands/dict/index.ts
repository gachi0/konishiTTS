import { db } from "../../lib/bot";
import { ICommand } from "../../service/types";
import { ComponentType } from "discord.js";
import { CUSTOMID_DICT_ADD_BTN, CUSTOMID_DICT_ADD_MODAL_WORD, CUSTOMID_DICT_ADD_MODAL_YOMI, CUSTOMID_DICT_DEL_BTN, DICT_ADD_MODAL, DICT_MESSAGE_BUTTONS, DICT_REMOVE_MODAL, dictEmbeds } from "./components";


export const dictCommand: ICommand = {
  data: {
    name: 'dict',
    description: '辞書の登録/削除/表示',
    descriptionLocalizations: {
      'ja': '辞書の登録/削除/表示',
      'ko': "사전의 등록/삭제/표시",
      'zh-CN': "词典的注册/删除/显示",
    },
    nameLocalizations: {
      'ja': "辞書",
      'ko': "사전",
      'zh-CN': "词典",
    },
  },

  guildOnly: true,

  execute: async intr => {

    if (intr.guildId === null) {
      return;
    }

    const dict = await db.kWord.findMany({ where: { guildId: intr.guildId } });

    const reped = await intr.reply({
      embeds: dictEmbeds(dict),
      components: [DICT_MESSAGE_BUTTONS],
    });


    const ctr = reped.createMessageComponentCollector<ComponentType.Button>({
      time: 1000 * 60 * 5,
      filter: ci => (ci.message.id !== reped.id),
    });

    // タイムアウトでボタン無効化
    // 125個登録済みで追加ボタン無効化
    // 0個で削除ボタン無効化。
    // とかいろいろ.......

    ctr.on('collect', async (ci) => {
      console.log('collected', ci.customId);

      if (ci.customId === CUSTOMID_DICT_ADD_BTN) {

        await ci.showModal(DICT_ADD_MODAL);

        const ms = await ci.awaitModalSubmit({
          time: 1000 * 60 * 2,
          filter: (modalI) => (console.log('2'), modalI.id === ci.id), // カンマ演算子
        });

        const word = ms.fields.getTextInputValue(CUSTOMID_DICT_ADD_MODAL_WORD);
        const yomi = ms.fields.getTextInputValue(CUSTOMID_DICT_ADD_MODAL_YOMI);



        // 125個以上の登録でエラー出したり。。

      } else if (ci.customId === CUSTOMID_DICT_DEL_BTN) {

        await ci.showModal(DICT_REMOVE_MODAL);

        const ms = await ci.awaitModalSubmit({
          time: 1000 * 60 * 2,
          filter: (modalI) => modalI.id === ci.id,
        });

        // 自分のGUILDの単語以外削除されないようにしたり。。

      }
    });
  }
};


