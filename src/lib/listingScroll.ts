// Per-history-entry positions survive a trip to a property without persisting
// inventory or user searches to local storage. Bound memory for long sessions.
const positions = new Map<string, number>();
export const listingScrollPosition = (key: string) => positions.get(key);
export function saveListingScrollPosition(key: string, y: number) {
  positions.set(key, y);
  if (positions.size > 100) positions.delete(positions.keys().next().value!);
}
