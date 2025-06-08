import { ApplicationCommandOptionType, AttachmentBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuComponent, StringSelectMenuInteraction } from "discord.js";
import { ICommand, INotParsedCommand } from "../service/types";
import { voicevox, vvInfo } from "../voicevox";
import { chunk } from "remeda";
import { txtColumns } from "../service/util";
import { db } from "../bot";
import { upsertQuery } from "../service/db";

const command: INotParsedCommand = {
  data: () => ({
    name: "speaker",
    description: "キャラクター情報を出します",
    options: chunk(vvInfo.speakers, 25).map((chunk, i) => ({
      name: `speaker${i + 1}`,
      description: `キャラクターの一覧の${i + 1}ページ目です。ここに乗っていないキャラクターは他のページを探してください。`,
      type: ApplicationCommandOptionType.String,
      choices: chunk.map(s => ({
        name: s.name, value: s.speaker_uuid,
      })),
    }))
  }),

  execute: async intr => {
    const chunks = chunk(vvInfo.speakers, 25);
    const uuid = Array.from({ length: chunks.length }, (_, i) => i)
      .reduce<string | undefined>(
        (cur, i) => intr.options.getString(
          `speaker${i + 1}`
        ) ?? cur,
        undefined,
      );

    const speaker = vvInfo.speakers.find(s => s.speaker_uuid === uuid);

    await intr.deferReply();
    if (!uuid) {
      await intr.reply('スピーカーを指定してね。');
      return;
    }

    const { data: speakerData } = await voicevox.GET('/speaker_info', {
      params: { query: { speaker_uuid: uuid } }
    });

    if (!speakerData || !speaker) {
      await intr.followUp('speaker取れなかったわ');
      return;
    }


    const image = new AttachmentBuilder(
      Buffer.from(speakerData.portrait, 'base64'),
      { name: 'image.png' }
    );

    const SPEAKER_CID = 'SET_SPEAKER_STYLE';

    const msg = await intr.followUp({
      files: [image],
      embeds: [
        {
          title: speaker?.name,
          description: txtColumns([
            `**スタイル一覧:** ${speaker?.styles.map(s => s.name).join(', ')}`,
            '',
            speakerData.policy,
          ]),
          thumbnail: { url: 'attachment://image.png' },
        },
      ],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            new StringSelectMenuBuilder({
              type: ComponentType.StringSelect,
              placeholder: '設定したいスタイルを選択してください',
              customId: SPEAKER_CID,
              options: speaker.styles.map(s => ({
                label: s.name,
                value: s.id.toString(),
              })),
            }).toJSON(),
          ],
        },
      ]
    });

    const res = await msg.awaitMessageComponent<ComponentType.StringSelect>({
      filter: (i) => i.user.id === intr.user.id && i.customId === SPEAKER_CID,
      time: 600000,
    });

    const speakerN = Number(res.values[0]);

    await db.kUser.upsert({
      where: { id: intr.user.id },
      create: { id: intr.user.id, speaker: speakerN },
      update: { id: intr.user.id, speaker: speakerN },
    });

    await res.reply(`更新したかも～`);
  }
};

export default command;

