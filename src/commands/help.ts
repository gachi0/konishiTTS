import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { ICommand, speakersName } from "../bot";

// コマンドのオプション（ApplicationCommandOptionTypeに対応）
const optionTypes = [
    "サブコマンド", "サブコマンドグループ", "文字列", "整数", "真偽値",
    "ユーザー", "チャンネル", "ロール", "メンション可能", "数値"];

const commands = new Map<string, ICommand>();

export const setHelpComamands = (cmds: Map<string, ICommand>) => {
    (help.data as SlashCommandBuilder)
        .addStringOption(new SlashCommandStringOption()
            .setName("command")
            .setDescription("使い方が知りたいコマンド名")
            .addChoices([...cmds].map(c => [c[0], c[0]])));
    [...cmds.values()].forEach(c => commands.set(c.data.name, c));
};

const help: ICommand = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("botの使い方を表示します。"),
    execute: async intr => {
        const option = intr.options.getString("command");
        if (option) {
            const cmd = commands.get(option);
            if (!cmd) {
                await intr.reply("存在しないコマンドです…");
                return;
            }
            const embed = new MessageEmbed({
                title: cmd.data.name,
                description: cmd.data.description,
            });
            embed.addField("情報",
                `実行可能な人: ${cmd.adminOnly ? "管理人のみ" : "全員"}\n`
                + `実行可能な場所: ${cmd.guildOnly ? "サーバー内のみ" : "全て"}`);

            if (cmd.data instanceof SlashCommandBuilder && cmd.data.options.length) {
                embed.addField("オプション",
                    cmd.data.options.map(o => o.toJSON()).reduce((l, r) =>
                        `${l}\n\n**\`${r.name}\`** ${r.required ? "[必須]" : "[省略可]"}[${optionTypes[r.type - 1]}]\n${r.description}`, ""));
            }
            await intr.reply({ embeds: [embed] });
        }
        else {
            const embed = new MessageEmbed({
                title: "botの使い方",
                description: "説明",
                fields: [...commands.values()].map(c => ({
                    name: `/${c.data.name}`,
                    value: c.data.description,
                    inline: true
                })),
                footer: { text: `クレジット\nVOICEVOX: ${speakersName.join(", ")}` }
            });
            await intr.reply({ embeds: [embed] });
        }
    }
};

export default help;