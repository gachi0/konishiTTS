import { ICommand } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { UserEntity } from "../db";

export default <ICommand>{
    data: new SlashCommandBuilder()
        .setName("user_read_message")
        .addBooleanOption(o => o
            .setName("read_message")
            .setDescription("読み上げる場合はTrueを、読み上げたくない場合はFalseを指定してください")
            .setRequired(true))
        .setDescription("自分のメッセージを読み上げるかどうかを切り替えます！"),
    execute: async intr => {
        const user = await UserEntity.get(intr.user.id);
        user.isRead = intr.options.getBoolean("read_message", true);
        await UserEntity.repo.save(user);
        await intr.reply(`${intr.user.username}のメッセージを読み上げま${user.isRead ? "す" : "せん"}！`);
    }
};