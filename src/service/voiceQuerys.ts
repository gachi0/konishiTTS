import { components } from "../openapi/schema";

type CmpSc = components['schemas'];
type AudioQuery = CmpSc['AudioQuery'];
type AccentPhrase = CmpSc['AccentPhrase'];
type Mora = CmpSc['Mora'];

const cutPhases = (
  aps: AccentPhrase[], max: number,
): AccentPhrase[] => {
  const res: AccentPhrase[] = [];
  let moras = 0;

  for (const ap of aps) {
    const phrase: AccentPhrase = { ...ap, moras: [] };
    moras += phrase.pause_mora ? 1 : 0;

    for (const mora of ap.moras) {
      phrase.moras.push(mora);
      moras++;
      if (max < moras) break;
    }

    res.push(phrase);
    if (max < moras) break;
  }

  return res;
};