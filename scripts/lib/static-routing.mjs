import { getTransformedRoutes } from '@vercel/routing-utils';

// Local eval host for the static subset of Vercel routes. Compile the actual
// config with Vercel's validator; do not maintain a second listing-route table.
export function createStaticRouting(config, findFile) {
  const { routes, error } = getTransformedRoutes(config);
  if (error) throw new Error(`Invalid Vercel routes: ${JSON.stringify(error)}`);
  return async url => {
    const headers = {};
    for (const route of routes ?? []) {
      if (route.handle === 'filesystem') {
        const file = await findFile(url.pathname);
        if (file) return { status: 200, file, headers };
        continue;
      }
      if (route.handle) throw new Error(`Unsupported routing phase in eval host: ${route.handle}`);
      const match = new RegExp(route.src).exec(url.pathname);
      if (!match) continue;
      const captures = { ...match.groups };
      match.forEach((value, index) => { captures[index] = value ?? ''; });
      const matches = condition => {
        if (condition.type !== 'query') throw new Error(`Unsupported condition in eval host: ${condition.type}`);
        const value = url.searchParams.get(condition.key);
        if (value === null) return false;
        if (condition.value === undefined) return true;
        const result = new RegExp(`^(?:${condition.value})$`).exec(value);
        if (result) Object.assign(captures, result.groups);
        return !!result;
      };
      if (!(route.has ?? []).every(matches) || (route.missing ?? []).some(matches)) continue;
      const substitute = value => value.replace(/\$(\w+)/g, (_, key) => captures[key] ?? '');
      for (const [key, value] of Object.entries(route.headers ?? {})) headers[key.toLowerCase()] = substitute(value);
      if (route.status && route.status >= 300 && route.status < 400) {
        if (headers.location && url.search && !headers.location.includes('?')) headers.location += url.search;
        return { status: route.status, headers };
      }
      if (route.dest) {
        const target = new URL(substitute(route.dest), url);
        const file = await findFile(target.pathname);
        if (file) return { status: 200, file, headers };
        if (!route.check) return { status: 404, headers };
      }
    }
    const file = await findFile(url.pathname);
    return { status: file ? 200 : 404, file, headers };
  };
}
