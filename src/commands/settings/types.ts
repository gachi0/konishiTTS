import { KUser } from "@prisma/client";
import { randomInteger } from "remeda";

type SettingOption<Model, K extends keyof Model> = {
  field: K,
  label: string,
  description: string,
  showText: (m: Model) => string,
};

/// 段階的な型推論を走らせるためのカリー化
/// 設定を生成
export const createSettingOption = <Model>() =>
  <K extends keyof Model>(
    k: K,
    o: Omit<SettingOption<Model, K>, 'field'>
  ): SettingOption<Model, K> => ({ ...o, field: k, });


