import { IEvent } from "../bot";

export default new class implements IEvent {
    name = "ready";
    execute = async () => {
        console.log("ログイン完了！");
    };
};