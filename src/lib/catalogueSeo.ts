/** Query filters are interactive searches; only category pagination is canonical. */
export const CATALOGUE_FILTER_KEYS = ['city', 'state', 'micromarket', 'fire', 'type', 'area', 'minSqft', 'maxSqft'] as const;

export function catalogueSeo(path: string, search: string) {
  const params = new URLSearchParams(search);
  const pageSize = path.startsWith('/overview/') ? '6' : '21';
  const rawPage = params.get('page');
  const page = rawPage === null ? 1 : Number(rawPage);
  const noindex = CATALOGUE_FILTER_KEYS.some(key => params.has(key))
    || (params.has('pageSize') && params.get('pageSize') !== pageSize)
    || params.getAll('pageSize').length > 1 || params.getAll('page').length > 1
    || (rawPage !== null && (!/^[1-9]\d*$/.test(rawPage) || !Number.isSafeInteger(page)));
  return { path: !noindex && page > 1 ? `${path}?page=${page}` : path, noindex };
}
