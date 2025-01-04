
export const upsertQuery = <T>(id: T) => ({
  where: { id }, update: { id }, create: { id }
});