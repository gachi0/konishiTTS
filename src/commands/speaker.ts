import { ICommand } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { UserEntity } from "../db";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .addStringOption(o => o
            .setName("speaker")
            .setDescription("喋る人")
            .setRequired(true)
            .addChoice("四国めたん(あまあま)", "0")
            .addChoice("四国めたん(ノーマル)", "2")
            .addChoice("四国めたん(セクシー)", "4")
            .addChoice("四国めたん(ツンツン)", "6")
            .addChoice("ずんだもん(あまあま)", "1")
            .addChoice("ずんだもん(ノーマル)", "3")
            .addChoice("ずんだもん(セクシー)", "5")
            .addChoice("ずんだもん(ツンツン)", "7")
            .addChoice("春日部つむぎ", "8")
            .addChoice("波音リツ", "9"))
        .setName("user_speaker")
        .setDescription("メッセージ読み上げる人を変更します！");

    execute = async (intr: CommandInteraction) => {
        const speaker = intr.options.getString("speaker", true);
        const user = await UserEntity.get(intr.user.id);
        user.speaker = Number(speaker);
        await UserEntity.repo.save(user);
        await intr.reply(`喋る人を${user.speaker}に変更しました！`);
    };
};
