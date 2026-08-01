/**
 * One reload per key per tab session.
 *
 * A deploy renames every build artifact and Vercel stops serving the previous
 * deployment's files, so a document that outlives its deploy — a tab left open,
 * a back/forward restore, an edge-cached page — points at filenames that now
 * 404. Reloading fetches a current document and fixes it.
 *
 * Fails closed: if sessionStorage is unavailable (some privacy modes) we must
 * not reload, or a genuinely broken page loops forever.
 */
export const claimReloadAttempt = (key: string): boolean => {
  try {
    const storageKey = `wog:stale-reload:${key}`;
    if (sessionStorage.getItem(storageKey)) return false;
    sessionStorage.setItem(storageKey, '1');
    return true;
  } catch {
    return false;
  }
};
