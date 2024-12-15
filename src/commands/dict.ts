import { InteractionReplyOptions, ModalBuilder, TextInputStyle, ComponentType, ButtonStyle, SlashCommandBuilder, PermissionsBitField, InteractionUpdateOptions } from "discord.js";
import { ICommand, } from "../bot";
import { DictEntity, GuildEntity } from "../db";

const getGuildDict = async (id: string) => await GuildEntity.get(id, true);

export default <ICommand>{
  data: new SlashCommandBuilder()
    .setName("dict")
    .setDescription("単語辞書を表示します"),
  guildOnly: true,

  execute: async intr => {
    if (!intr.guildId || !intr.channel || !intr.member) return;
    let guild = await getGuildDict(intr.guildId);

    // 必要な関数と変数の定義
    /** 送信するメッセージを生成 */
    const replyContent = (): InteractionReplyOptions => {
      let descrtiption = `ページ: ${nowPage}/${pageCount()}`;
      descrtiption += nowPageDict().length ? "" : "\n現在辞書に単語は登録されていません";
      return {
        embeds: [{
          title: "辞書一覧",
          description: descrtiption,
          fields: nowPageDict().map(d => ({
            name: d.word,
            value: `読み: \`${d.yomi}\`\n作者: <@${d.authorId}>`,
            inline: true
          }))
        }],
        components: [{
          type: ComponentType.ActionRow,
          components: [
            { type: ComponentType.Button, customId: "dictAdd", emoji: "➕", label: "追加", style: ButtonStyle.Primary },
            { type: ComponentType.Button, customId: "dictDel", emoji: "🗑️", label: "削除", style: ButtonStyle.Danger },
            { type: ComponentType.Button, customId: "dictReload", emoji: "🔃", label: "再読込", style: ButtonStyle.Primary }
          ]
        },
        {
          type: ComponentType.ActionRow,
          components: [
            { type: ComponentType.Button, customId: "dictLPage", emoji: "⬅", style: ButtonStyle.Primary },
            { type: ComponentType.Button, customId: "dictRPage", emoji: "➡", style: ButtonStyle.Primary },
          ]
        }]
      };
    };
    /** 現在の表示ページ */
    let nowPage = 1;
    /**  総ページ数 */
    const pageCount = () => Math.floor(guild.dict.length / 25) + 1;
    /** ページに表示する単語の一覧を出す関数 */
    const nowPageDict = () => guild.dict.slice((nowPage - 1) * 25, nowPage * 25);

    // 処理
    // 辞書の1ページ目を送信
    const reply = await intr.reply(replyContent());

    // ボタンが押されるのを待つループ
    for (; ;) {

      // ボタンが押されるのを待つ タイムアウトしたらnullが代入される
      const btnIntr = await reply.awaitMessageComponent({
        filter: i => intr.user.id === i.user.id, time: 45000
      }).catch(() => null);

      // タイムアウト
      if (!btnIntr) {
        // ボタンを無効化して終了
        const replyContentData = replyContent();
        replyContentData.components = [];
        await intr.editReply(replyContentData);
        break;
      }

      // 追加ボタンが押された
      if (btnIntr.customId === "dictAdd") {

        // モーダルウィンドウで登録させる単語を出す
        const modal = new ModalBuilder({
          title: "単語登録", customId: "dictRegist",
          components: [{
            type: ComponentType.ActionRow, components: [
              { type: ComponentType.TextInput, customId: "dictWord", label: "単語", minLength: 1, maxLength: 25, style: TextInputStyle.Short }]
          },
          {
            type: ComponentType.ActionRow, components: [
              { type: ComponentType.TextInput, customId: "dictYomi", label: "読み", minLength: 1, maxLength: 25, style: TextInputStyle.Short }]
          }]
        });
        await btnIntr.showModal(modal);

        // モーダル押されるのを待つ
        const modalResult = await btnIntr.awaitModalSubmit({ time: 85000 }).catch(() => null);
        if (!modalResult) continue;

        // 単語をDBに登録
        const dictWord = modalResult.fields.getTextInputValue("dictWord");
        const dictYomi = modalResult.fields.getTextInputValue("dictYomi");
        const newWord = new DictEntity(intr.user.id, dictWord, dictYomi, intr.guildId);
        await DictEntity.repo.save(newWord);

        // 結果を報告
        await modalResult.reply({
          embeds: [
            { title: "単語を登録しました", description: `単語: \`${dictWord}\`\n読み: \`${dictYomi}\`` }]
        });
        // 辞書に反映
        guild = await getGuildDict(intr.guildId);
        await btnIntr.editReply(replyContent());
      }

      // 削除ボタンが押された
      if (btnIntr.customId === "dictDel") {

        // 削除する単語を選択させるメッセージを送信
        const delSelect = await btnIntr.reply({
          content: "削除する単語を選択してください",
          components: [{
            type: ComponentType.ActionRow, components: [{
              type: ComponentType.StringSelect,
              customId: "dictDelSelect",
              maxValues: guild.dict.length,
              options: guild.dict.map(d => ({ label: `${d.word}: ${d.yomi}`, value: d.id.toString() }))
            },]
          },
          {
            type: ComponentType.ActionRow, components: [{
              type: ComponentType.Button,
              customId: "dictDelCancel",
              label: "キャンセル",
              style: ButtonStyle.Primary
            }]
          }],
          fetchReply: true
        });

        // 応答を待つ
        const delSelectResult = await delSelect.awaitMessageComponent(
          { filter: i => intr.user.id === i.user.id, time: 60000 }
        ).catch(() => null);

        // キャンセルされた場合
        if (delSelectResult?.isButton()) {
          await delSelectResult.update({
            content: "キャンセルされました。",
            components: []
          });
        }

        if (!delSelectResult?.isStringSelectMenu() || typeof intr.member.permissions === "string") continue; // ガード

        const delWords = guild.dict.filter(d => delSelectResult.values.includes(d.id.toString()));

        if (!delWords.every(w => w.authorId === intr.user.id) && !intr.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          await delSelectResult.reply({ content: "登録した本人以外の単語を削除することは出来ません", ephemeral: true });
          await delSelect.delete();
          continue;
        }

        // 辞書から単語を削除
        await DictEntity.repo.delete(delSelectResult.values);

        // 結果を報告
        await delSelectResult.update({
          content: "",
          embeds: [{
            title: "単語を削除しました",
            description: delWords.reduce((l, r) => `${l}\n\`${r.word}\`: \`${r.yomi}\``, "")
          }],
          components: []
        });
        // 辞書のメッセージに反映
        guild = await getGuildDict(intr.guildId);
        await btnIntr.editReply(replyContent());
      }

      // 左のページボタンが押された
      if (btnIntr.customId === "dictLPage") {
        nowPage = nowPage === 1 ? pageCount() : nowPage - 1;
        guild = await getGuildDict(intr.guildId);
        await btnIntr.update(replyContent() as InteractionUpdateOptions);
      }

      // 右のページボタンが押された
      if (btnIntr.customId === "dictRPage") {
        nowPage = nowPage === pageCount() ? 1 : nowPage + 1;
        guild = await getGuildDict(intr.guildId);
        await btnIntr.update(replyContent() as InteractionUpdateOptions);
      }

      /** リロードボタンが押された */
      if (btnIntr.customId === "dictReload") {
        guild = await getGuildDict(intr.guildId);
        await btnIntr.update(replyContent() as InteractionUpdateOptions);
      }
    }
  }
};