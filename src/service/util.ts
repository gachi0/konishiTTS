/** 配列を{size}個ずつの配列に分割 */
export const chunkArray = <T>(
  ary: T[], size: number
): T[][] => Array.from(
  { length: Math.ceil(ary.length / size) },
  (_, i) => ary.slice(size * i, size * (i + 1))
);
