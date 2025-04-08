export const txtColumns = (columns: string[]) =>
  columns.join('\n');

export const aryWhen = <T>(cond: boolean, obj: T): [T] | [] =>
  cond ? [obj] : [];
