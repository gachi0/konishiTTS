import { APIEmbed, APIEmbedField, ApplicationCommandOptionData, ApplicationCommandOptionType } from "discord.js";
import { ICommand } from "../service/types";
import dedent from "dedent";

const optionTypes: Record<number, string> = {
  [ApplicationCommandOptionType.Subcommand]: "サブコマンド",
  [ApplicationCommandOptionType.SubcommandGroup]: "サブコマンドグループ",
  [ApplicationCommandOptionType.String]: "文字列",
  [ApplicationCommandOptionType.Integer]: "整数",
  [ApplicationCommandOptionType.Boolean]: "真偽値",
  [ApplicationCommandOptionType.User]: "ユーザー",
  [ApplicationCommandOptionType.Channel]: "チャンネル",
  [ApplicationCommandOptionType.Role]: "ロール",
  [ApplicationCommandOptionType.Mentionable]: "メンション可能",
  [ApplicationCommandOptionType.Number]: "数値",
};


export const commandHelpEmbed = (
  cmd: ICommand,
): APIEmbed => ({
  title: cmd.data.name,
  description: cmd.data.description,
  fields: [
    {
      name: "情報",
      value: dedent`
        実行可能な人: ${cmd.adminOnly ? "管理人のみ" : "全員"}
        実行可能な場所: ${cmd.guildOnly ? "サーバー内のみ" : "全て"}`
    },
    ...cmd.data.options ? [optionsField(cmd.data.options)] : []
  ]
});


const optionsField = (
  options: readonly ApplicationCommandOptionData[]
): APIEmbedField => ({
  name: 'オプション',
  value: options
    .filter(o =>
      o.type !== ApplicationCommandOptionType.SubcommandGroup
      && o.type !== ApplicationCommandOptionType.Subcommand
    )
    .reduce((acc, o) =>
      dedent`
        ${acc}

        **${o.name}**
        [${o.required ? "必須" : "省略可"}]
        [${optionTypes[o.type - 1]}]
        ${o.description}`,
      ""
    ),
});


export const botDescription = (cmds: ICommand[], speakers: string[]): APIEmbed[] => [
  {
    title: "概要",
    description: "VOICEVOXの読み上げBotです。"
      + "`/join`コマンドで読み上げを開始します！",
    fields: [{
      name: "リンク",
      value: dedent`
      - [リポジトリ](https://github.com/gachi0/konishiTTS)
      - [VOICEVOX](https://voicevox.hiroshiba.jp)`
    }],
    footer: { text: `クレジット\nVOICEVOX: ${speakers.join(", ")}` }
  },
  {
    title: "コマンド一覧",
    fields: [...cmds.values()].map(c => ({
      name: `/${c.data.name}`,
      value: c.data.description,
      inline: true
    })),
  }
];


export const genHelpCommandData = (cmds: Map<string, ICommand>) => ({
  name: "help",
  description: "botの使い方を表示します。",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "command",
      description: "使い方が知りたいコマンド名",
      choices: [...cmds].map(
        ([name]) => ({ name, value: name })
      )
    }
  ]
});
