/** True if `sceneId` looks like a Postgres/Supabase UUID (scene row primary key). */
export function isDatabaseSceneUuid(sceneId: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    sceneId,
  );
}
