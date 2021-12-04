import { ICommand } from "../bot";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default new class implements ICommand {
    data = new SlashCommandBuilder()
        .setName("bnd")
        .setDescription("Brand New Day歌いまーす！！");
    execute = async (intr: CommandInteraction) => {
        await intr.reply(`Brand New Day歌いまーす！！！！
A Brand New Day-eh-eh-eh-eh-eh-eeee-eh-eh　eh-eh No Brand Day　eh-eeeeee-eh　eh-eh-ee-eh-eee... A Brand New Day-eh-eh-eh-eh-eh-eeee-eh-eh　eh-eh No Brand Day　oh-o-oo-oh-ooo-oh-oh-oh....
退屈な日を抜けていこう`);
    };
};
