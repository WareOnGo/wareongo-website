const TRANSIENT_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const MAX_DELAY_MS = 5000;

function pause(ms, signal) {
  return new Promise((resolve, reject) => {
    let timer;
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      reject(signal?.reason ?? new DOMException('Request aborted', 'AbortError'));
    };
    if (signal?.aborted) { abort(); return; }
    timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', abort, { once: true });
  });
}

function retryDelay(response, attempt) {
  const backoff = 500 * 2 ** attempt + Math.floor(Math.random() * 250);
  const header = response?.headers.get('retry-after');
  if (!header) return backoff;
  const seconds = Number(header);
  const requested = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(header) - Date.now();
  // A long server cooldown ends this bounded operation; don't retry sooner
  // than requested or leave a browser/build waiting indefinitely.
  if (requested > MAX_DELAY_MS) return null;
  return Number.isFinite(requested) ? Math.max(backoff, requested) : backoff;
}

/**
 * Retry temporary read failures twice with backoff and jitter. Final HTTP
 * responses/errors are preserved so existing 404 handling and build guards
 * still apply. Cancelling pagination also cancels any pending retry.
 * @param {string | URL} url
 * @param {RequestInit} [init]
 * @returns {Promise<Response>}
 */
export async function fetchRead(url, init = {}) {
  const method = (init.method ?? 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') return fetch(url, init);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    init.signal?.throwIfAborted();
    let response;
    try {
      response = await fetch(url, init);
    } catch (error) {
      if (init.signal?.aborted || !(error instanceof TypeError) || attempt === MAX_ATTEMPTS - 1) throw error;
      await pause(retryDelay(null, attempt), init.signal);
      continue;
    }
    if (!TRANSIENT_STATUS.has(response.status) || attempt === MAX_ATTEMPTS - 1) return response;
    const delay = retryDelay(response, attempt);
    if (delay === null) return response;
    // Release the failed response's socket before making another request.
    await response.body?.cancel().catch(() => {});
    await pause(delay, init.signal);
  }
}
