import { IEvent } from "../bot";

export default new class implements IEvent {
    name = "interactionCreate";
    execute = async () => {
        console.log("ログイン完了！");
    };
};