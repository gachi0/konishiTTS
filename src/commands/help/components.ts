import { APIEmbed, APIEmbedField, ApplicationCommandOptionData, ApplicationCommandOptionType, hyperlink } from "discord.js";
import { ICommand } from "../../service/types";
import { vvInfo } from "../../lib/voicevox";

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


// 定数ではなく、関数で生成しなければいけない理由は、ヘルプコマンド自体が動的に生成されるから


export const commandHelpEmbed = (
  cmd: ICommand,
): APIEmbed => ({
  title: cmd.data.name,
  description: cmd.data.description ?? 'なし',
  fields: [
    {
      name: "情報",
      value: [
        `実行可能な人: ${cmd.adminOnly ? "管理人のみ" : "全員"}`,
        `実行可能な場所: ${cmd.guildOnly ? "サーバー内のみ" : "全て"}`,
      ].join('\n')
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
    .map(o => [
      `**${o.name}**`,
      `[${o.required ? "必須" : "省略可"}]`,
      `[${optionTypes[o.type - 1]}]`,
      o.description,
    ].join('\n'))
    .join('\n'),
});


export const botDescription = (commands: ICommand[]): APIEmbed[] => [
  {
    title: "概要",
    description: "VOICEVOXの読み上げBotです。"
      + "`/join`コマンドで読み上げを開始します！",
    fields: [{
      name: "リンク",
      value: [
        `- ${hyperlink('リポジトリ', 'https://github.com/gachi0/konishiTTS')}`,
        `- ${hyperlink('VOICEVOX', 'https://voicevox.hiroshiba.jp')}`,
      ].join('\n')
    }],
    footer: { text: `クレジット\nVOICEVOX: ${vvInfo.speakers.join(", ")}` }
  },
  {
    title: "コマンド一覧",
    fields: commands.map(({ data: d }) => ({
      name: `/${d.name}`,
      value: d.description,
      inline: true
    })),
  }
];


export const helpSlashCommandData = (cmds: ICommand[]) => ({
  name: "help",
  description: "botの使い方を表示します。",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "command",
      description: "使い方が知りたいコマンド名",
      choices: cmds.map(
        ({ data: d }) => ({ name: d.name, value: d.description })
      )
    }
  ]
});
