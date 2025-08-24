import { ActivityType } from "discord.js";
import { createEvent } from "../service/types";

export default createEvent("ready", async client => {
  console.log("ログイン完了！");

  await client.user.setActivity(
    "/helpで使い方を表示",
    { type: ActivityType.Competing }
  );
});

