import { ApplicationCommandOptionType, AttachmentBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuComponent, StringSelectMenuInteraction } from "discord.js";
import { ICommand } from "../service/types";
import { VoicevoxInfoStore, vvClient } from "../lib/voicevox";
import { chunk } from "remeda";
import { db } from "../lib/bot";

const SPEAKER_CID = 'SET_SPEAKER_STYLE';

export const genSpeakerCommand = (vvInfo: VoicevoxInfoStore): ICommand => {

  const chunkedSpeakers = chunk(vvInfo.speakers, 25);

  return ({
    data: {
      name: "speaker",
      description: "キャラクター情報を出します",
      options: chunkedSpeakers.map((chunk, i) => ({
        name: `speaker${i}`,
        description: `キャラクターの一覧の${i + 1}ページ目です。ここに乗っていないキャラクターは他のページを探してください。`,
        type: ApplicationCommandOptionType.String,
        choices: chunk.map(s => ({
          name: s.name, value: s.speaker_uuid,
        })),
      }))
    },

    execute: async intr => {

      // 最初の非null値探索
      const speakerParam = chunkedSpeakers
        .map((_, i) => intr.options.getString(`speaker${i}`))
        .find(v => v != null);

      // 引数指定されなかったのでスピーカー一覧
      if (!speakerParam) {
        await intr.reply({
          embeds: chunkedSpeakers.map((chunk, i) => ({
            title: `利用可能なスピーカの一覧(${i + 1}/${chunkedSpeakers.length})`,
            fields: chunk.map(s => ({
              name: s.name,
              value: s.styles.map(st => st.name).join(', '),
              inline: true,
            }))
          }))
        });
        return;
      }

      // スピーカー情報返却
      await intr.deferReply();
      const speakerData = await vvClient.speakerInfo(speakerParam);
      const speaker = vvInfo.speakers.find(s => s.speaker_uuid === speakerParam);

      if (!speaker) {
        await intr.followUp('speaker取れなかったわ');
        return;
      }

      const image = new AttachmentBuilder(
        Buffer.from(speakerData.portrait, 'base64'),
        { name: 'image.png' },
      );

      const msg = await intr.followUp({
        files: [image],
        embeds: [
          {
            title: speaker?.name,
            thumbnail: { url: 'attachment://image.png' },
            description: [
              `**スタイル一覧:** ${speaker?.styles.map(s => s.name).join(', ')}`,
              '',
              speakerData.policy,
            ].join('\n'),
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
              }),
            ],
          },
        ]
      });

      const res = await msg.awaitMessageComponent<ComponentType.StringSelect>({
        filter: i => i.user.id === intr.user.id && i.customId === SPEAKER_CID,
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
  });
};

