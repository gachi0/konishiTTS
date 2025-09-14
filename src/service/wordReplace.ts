type StringSegment = { txt: string; replaced: boolean; };

export const safeReplaces = (
  target: string,
  pairs: [string, string][]
): string => {

  const initialSegments: StringSegment[] = [{ txt: target, replaced: false }];

  // 2. 各置換ペアに対して reduce を使ってセグメントリストを順次変換する
  const finalSegments = pairs.reduce((acc, [from, to]) => {

    // 置換元が空文字列の場合は無限ループを避けるためにスキップする
    if (from === '') {
      return acc;
    }

    // 3. flatMap を使って各セグメントを処理し、新しいセグメントの配列を生成する
    return acc.flatMap((segment) => {
      // 既に置換済みのセグメントはそのまま返す
      if (segment.replaced) {
        return [segment];
      }

      // 未置換セグメントのテキストを `from` で分割する
      const parts = segment.txt.split(from);

      // `from` が見つからなかった場合も、セグメントはそのまま返す
      if (parts.length === 1) {
        return [segment];
      }

      // `from` が見つかった場合、分割された部分と置換後の部分で新しいセグメントを再構成する
      const newSegments: StringSegment[] = [];

      parts.forEach((part, i) => {
        if (part !== '') {
          newSegments.push({ txt: part, replaced: false });
        }
        if (i < parts.length - 1) {
          newSegments.push({ txt: to, replaced: true });
        }
      });

      return newSegments;
    });
  },
    initialSegments
  );

  // 4. 最終的に得られた全セグメントのテキストを結合して返す
  return finalSegments.map((s) => s.txt).join('');
};