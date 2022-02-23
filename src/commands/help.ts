import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import commands from "./helpOtherCommands";
import { ICommand } from "../bot";

// コマンドのオプション（ApplicationCommandOptionTypeに対応）
const optionTypes = [
    "サブコマンド", "サブコマンドグループ", "文字列", "整数", "真偽値",
    "ユーザー", "チャンネル", "ロール", "メンション可能", "数値"];

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("help")
        .addStringOption(new SlashCommandStringOption()
            .setName("command")
            .setDescription("使い方が知りたいコマンド名")
            .addChoices([...commands].map(c => [c[0], c[0]])))
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
                fields: [
                    {
                        name: "情報",
                        value: `実行可能な人: ${cmd.adminOnly ? "管理人のみ" : "全員"}\n`
                            + `実行可能な場所: ${cmd.guildOnly ? "サーバー内のみ" : "全て"}`
                    }
                ]
            });
            if (cmd.data instanceof SlashCommandBuilder && cmd.data.options.length) {
                embed.addField("オプション",
                    cmd.data.options.map(o => o.toJSON()).reduce((l, r) =>
                        `${l}\n\n**\`${r.name}\`** ${r.required ? "[必須]" : "[省略可]"}[${optionTypes[r.type - 1]}]${r.description}`, ""));
            }
            await intr.reply({ embeds: [embed] });
        }
        else {
            const embed = new MessageEmbed({
                title: "botの使い方",
                description: "説明",
                fields: [...commands.values()].map(c => ({
                    name: `/${c.data.name}`,
                    value: c.data.description
                }))
            });
            await intr.reply({ embeds: [embed] });
        }
    }
};
