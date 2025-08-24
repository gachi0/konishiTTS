import { ICommand } from "../../service/types";
import { db } from "../../lib/bot";
import { upsertQuery } from "../../service/db";
import { awaitUserSettingOptionSelect, USER_SETTING_COMPONENT, userSettingView } from "./func";
import { KUser } from "@prisma/client";

const command: ICommand = {
  data: {
    name: "user_setting",
    description: "Botのユーザー設定を変更/閲覧します。話すキャラクターはここで変更できます。",
  },
  async execute(intr) {
    const uid = intr.user.id;
    const user = await db.kUser.upsert(upsertQuery(uid));

    // 1. 設定を表示、変更する設定を選ばせる (セレクトメニュ) 用意
    // 2. 変更された設定の詳細を表示 (説明, 設定値の説明など) 変更可能コンポーネント表示。
    // 3. 反映、反映の旨のメッセージを表示。
    // 1. に戻る。

    const reped = await intr.reply({
      embeds: [userSettingView(user)],
      components: [USER_SETTING_COMPONENT]
    });

    await awaitUserSettingOptionSelect(uid, reped);

  }
};

export default command;
