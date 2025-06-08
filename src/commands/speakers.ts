import { ICommand } from "../service/types";
import { vvInfo } from "../voicevox";
import { chunk } from "remeda";

const command: ICommand = {
  data: {
    name: "speakers",
    description: "キャラクターの一覧を出します",
  },
  execute: async intr => {

    const chunkSpeakers = chunk(vvInfo.speakers, 25);

    await intr.reply({
      embeds: chunkSpeakers.map((chunk, i) => ({
        title: `利用可能なスピーカの一覧(${i + 1}/${chunkSpeakers.length})`,
        fields: chunk.map(s => ({
          name: s.name,
          value: s.styles.map(st => st.name).join(', '),
          inline: true,
        }))
      }))
    });
  }
};

export default command;

