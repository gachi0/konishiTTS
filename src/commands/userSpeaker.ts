import { ICommand, speakersInfo } from "../bot";
import { SlashCommandBuilder, SlashCommandIntegerOption } from "@discordjs/builders";
import { UserEntity } from "../db";

// コマンドのオプション
const speakerOptions = new SlashCommandIntegerOption()
    .setName("speaker")
    .setDescription("喋る人")
    .setRequired(true);
for (const [num, name] of speakersInfo) {
    speakerOptions.addChoice(name, num);
}

export default <ICommand>{
    data: new SlashCommandBuilder()
        .addIntegerOption(speakerOptions)
        .setName("user_speaker")
        .setDescription("メッセージ読み上げる人を変更します！"),
    execute: async intr => {
        const user = await UserEntity.get(intr.user.id);
        user.speaker = intr.options.getInteger("speaker", true);
        await UserEntity.repo.save(user);
        await intr.reply(`喋る人を${speakersInfo.get(user.speaker)}に変更しました！`);
    }
};