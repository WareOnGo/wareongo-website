/** Browser console output for PM reviews; observing a request never sends an event. */
declare global {
  interface Window {
    __WAREONGO_GA4_CONSOLE_INSTALLED__?: boolean;
  }
}

function log(...args: unknown[]) {
  try {
    // Explicit window access preserves these review logs when Vite drops ordinary console calls.
    window.console.log(...args);
  } catch { /* Console tooling must not interrupt navigation or analytics. */ }
}

export function logAnalyticsCommand(args: unknown[], enabled: boolean) {
  const snapshot = args.map(arg => arg && typeof arg === 'object' && !(arg instanceof Date) ? { ...arg } : arg);
  log(enabled ? '[GA4] command' : '[GA4] preview (sending disabled)', ...snapshot);
}

const parameterNames: Record<string, string> = {
  tid: 'measurement_id', cid: 'client_id', sid: 'session_id', sct: 'session_number',
  dl: 'page_location', dt: 'page_title', dr: 'page_referrer', ul: 'language',
  sr: 'screen_resolution', seg: 'session_engaged', _et: 'engagement_time_msec',
};

/** Install before gtag.js loads: automatic events do not pass through window.gtag. */
export function installAnalyticsConsole(measurementId: string) {
  if (typeof window === 'undefined' || window.__WAREONGO_GA4_CONSOLE_INSTALLED__) return;
  window.__WAREONGO_GA4_CONSOLE_INSTALLED__ = true;

  const collectionUrl = (input: string | URL | Request): URL | undefined => {
    try {
      const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, window.location.href);
      if (/^(?:[a-z0-9-]+\.)*(?:google-analytics\.com|analytics\.google\.com)$/.test(url.hostname)
        && /^\/(?:g\/)?collect$/.test(url.pathname)) return url;
    } catch { /* Ignore unrelated or invalid requests. */ }
  };

  const logPayload = (url: URL, body: string, transport: string) => {
    // Google can batch several events in a newline-separated POST body.
    const lines = body.split('\n').filter(Boolean);
    for (const line of lines.length ? lines : ['']) {
      const fields = new URLSearchParams(url.search);
      new URLSearchParams(line).forEach((value, key) => fields.set(key, value));
      const event = fields.get('en');
      if (fields.get('tid') !== measurementId || !event) continue;
      const parameters: Record<string, string | number> = {};
      fields.forEach((value, key) => {
        if (key.startsWith('epn.')) parameters[key.slice(4)] = Number.isFinite(Number(value)) ? Number(value) : value;
        else if (key.startsWith('ep.')) parameters[key.slice(3)] = value;
        else if (parameterNames[key]) parameters[parameterNames[key]] = value;
      });
      log('[GA4] request', event, parameters, { transport, raw_parameters: Object.fromEntries(fields) });
    }
  };

  const observe = (input: string | URL | Request, body: unknown, transport: string) => {
    try {
      const url = collectionUrl(input);
      if (!url) return;
      if (body == null || typeof body === 'string' || body instanceof URLSearchParams) {
        logPayload(url, body == null ? '' : String(body), transport);
      } else if (body instanceof Blob || body instanceof Request) {
        // Clone Request bodies so observing them cannot consume the real fetch body.
        const readable = body instanceof Request ? body.clone() : body;
        void readable.text().then(text => logPayload(url, text, transport)).catch(() => {});
      } else if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
        logPayload(url, new TextDecoder().decode(body), transport);
      }
    } catch { /* A review logger must never change the original request's behavior. */ }
  };

  if (window.navigator?.sendBeacon) {
    const sendBeacon = window.navigator.sendBeacon;
    window.navigator.sendBeacon = function (...args) {
      observe(args[0], args[1], 'sendBeacon');
      return Reflect.apply(sendBeacon, this, args);
    };
  }
  if (window.fetch) {
    const fetch = window.fetch;
    window.fetch = function (...args) {
      const [input, init] = args;
      observe(input, init?.body ?? (input instanceof Request ? input : undefined), 'fetch');
      return Reflect.apply(fetch, this, args);
    };
  }
  if (window.XMLHttpRequest) {
    const urls = new WeakMap<XMLHttpRequest, string | URL>();
    const prototype = window.XMLHttpRequest.prototype;
    const open = prototype.open;
    const send = prototype.send;
    prototype.open = function (...args: Parameters<typeof open>) {
      urls.set(this, args[1]);
      return Reflect.apply(open, this, args);
    } as typeof open;
    prototype.send = function (...args) {
      const url = urls.get(this);
      if (url) observe(url, args[0], 'XMLHttpRequest');
      return Reflect.apply(send, this, args);
    };
  }
  // Cover Google's image/GET fallback without changing image loading.
  if (window.PerformanceObserver) {
    try {
      const observer = new window.PerformanceObserver(list => {
        for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
          if (entry.initiatorType === 'img') observe(entry.name, undefined, 'image');
        }
      });
      observer.observe({ type: 'resource', buffered: true });
    } catch { /* Older browsers may not support resource observation. */ }
  }
}
