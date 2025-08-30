
export const getOrCreate = <T>(id: T) => ({
  where: { id }, update: { id }, create: { id }
});