import { config, ICommand, speakersInfo } from "../bot";
import { GuildEntity } from "../db";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("guild_setting")
        .setDescription("Botのサーバー設定を変更します。オプションなしで送信された場合、現在の設定の一覧を表示します。")
        .addIntegerOption(o => o
            .setName("speaker")
            .setDescription("サーバーのデフォルトの音声")
            .addChoices(...[...speakersInfo].map(s => ({ name: s[1], value: s[0] }))))
        .addIntegerOption(o => o
            .setName("max_char")
            .setDescription("読み上げる最大文字数"))
        .addBooleanOption(o => o
            .setName("read_name")
            .setDescription("メッセージの送信者の名前を読み上げるかどうか。読み上げる場合はTrueを、読み上げない場合はFalseを設定してください。"))
        .addNumberOption(o => o
            .setName("speed")
            .setDescription("読み上げの速度。0.5から2.0までの範囲で指定してください"))
        .addStringOption(o => o
            .setName("join_text")
            .setDescription("VC入室時に読み上げられる文字列。{name}は入室したユーザー名に置き換えられます。"))
        .addBooleanOption(o => o
            .setName("vc_join_read")
            .setDescription("VC入室時に入室者の名前を読み上げるかどうか。読み上げる場合はTrueを、読み上げない場合はFalseを設定してください。")),

    guildOnly: true,
    adminOnly: true,

    execute: async intr => {
        if (!intr.guild || !intr.guildId) return;
        const guild = await GuildEntity.get(intr.guildId);

        const speaker = intr.options.getInteger("speaker");
        const maxChar = intr.options.getInteger("max_char");
        const readName = intr.options.getBoolean("read_name");
        const speed = intr.options.getNumber("speed");
        const joinText = intr.options.getString("join_text");
        const vcJoinRead = intr.options.getBoolean("vc_join_read");

        // オプションが何も設定されていなかったら
        if ([speaker, maxChar, joinText, speed, vcJoinRead, readName].every(o => o === null)) {
            await intr.reply({
                embeds: [{
                    title: `${intr.guild.name}の設定`,
                    fields: [
                        { name: "デフォルトの声", value: `${speakersInfo.get(guild.speaker)}` },
                        { name: "読み上げる文字数の上限", value: guild.maxChar.toString() },
                        { name: "名前の読み上げ", value: guild.readName ? "ON" : "OFF" },
                        { name: "話速(0.5~2.0)", value: guild.speed.toString() },
                        { name: "VC入室時に読み上げられる文字列", value: `\`${guild.joinerText}\`` },
                        { name: "VC入室者の名前読み上げ", value: guild.joinerReadName ? "ON" : "OFF" },
                    ]
                }]
            });
            return;
        }
        // オプション指定ありだった場合

        const embed = new EmbedBuilder({ title: `${intr.guild.name}の設定` });
        if (speaker !== null) {
            embed.addFields([{
                name: "デフォルトの声",
                value: `${speakersInfo.get(guild.speaker)} から ${speakersInfo.get(speaker)} に変更しました。`
            }]);
            guild.speaker = speaker;
        }
        if (maxChar !== null) {
            if (0 <= maxChar && maxChar <= config.readMaxCharLimit) {
                embed.addFields([{
                    name: "読み上げる文字数の上限",
                    value: `${guild.maxChar} から ${maxChar} に変更しました。`
                }]);
                guild.maxChar = maxChar;
            }
            else {
                embed.addFields([{
                    name: "読み上げる文字数の上限",
                    value: `0から${config.readMaxCharLimit}までの範囲で指定してください！\n`
                        + `指定された値: ${maxChar}`
                }]);
            }
        }
        if (readName !== null) {
            embed.addFields([{
                name: "名前の読み上げ",
                value: `名前の読み上げを ${guild.readName} から ${readName} に変更しました。`
            }]);
            guild.readName = readName;
        }
        if (speed !== null) {
            if (0.5 <= speed && speed <= 2) {
                embed.addFields([{
                    name: "話速",
                    value: `${guild.speed} から ${speed} に変更しました。`
                }]);
                guild.speed = speed;
            }
            else {
                embed.addFields([{
                    name: "読み上げる文字数の上限",
                    value: "0.5から2.0までの範囲で指定してください！\n"
                        + `指定された値: ${maxChar}`
                }]);
            }
        }
        if (joinText) {
            if (joinText.length <= 100) {
                embed.addFields([{
                    name: "VC入室時に読み上げられる文字列",
                    value: `\`${guild.joinerText}\` から \`${joinText}\` に変更しました。`
                }]);
                guild.joinerText = joinText;
            }
            else {
                embed.addFields([{
                    name: "VC入室時に読み上げられる文字列",
                    value: "100文字以下で指定してください！\n"
                        + `指定された文字数: ${joinText.length}`
                }]);
            }
        }
        if (vcJoinRead !== null) {
            embed.addFields([{
                name: "VC入室時の名前読み上げ",
                value: `${guild.joinerReadName} から ${vcJoinRead} に変更しました。`
            }]);
            guild.joinerReadName = vcJoinRead;
        }
        await GuildEntity.repo.save(guild);
        await intr.reply({ embeds: [embed] });
    }
};