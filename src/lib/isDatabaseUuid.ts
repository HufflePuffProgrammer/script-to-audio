/** Matches Postgres `uuid` / `scenes.id` style ids (not app keys like `"2"`). */
const DB_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isDatabaseUuid(value: string): boolean {
  return DB_UUID_RE.test(value);
}
