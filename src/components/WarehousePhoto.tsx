import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

const IMAGE_TIMEOUT_MS = 15_000;

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onLoad' | 'onError'> & {
  primary: string;
  initialSrc: string;
  /** A build-generated card cover; remote primary/original recovery stays intact. */
  preview?: string;
  fallback: string | null;
  onLoaded: (url: string) => void;
  onFailed: () => void;
  showLoadingIndicator?: boolean;
};

/** Optional local cover, one primary, one fallback, then a terminal result. */
export default function WarehousePhoto({ primary, initialSrc, preview, fallback, srcSet, onLoaded, onFailed, loading = 'eager', showLoadingIndicator = true, ...props }: Props) {
  const [src, setSrc] = useState(initialSrc !== primary ? initialSrc : preview ?? initialSrc);
  const [responsive, setResponsive] = useState(true);
  const activeSrcSet = responsive && src === primary ? srcSet : undefined;
  const [pending, setPending] = useState(true);
  const image = useRef<HTMLImageElement>(null);
  const attempted = useRef(new Set<string>());
  const settled = useRef(new Set<string>());
  const callbacks = useRef({ onLoaded, onFailed });
  callbacks.current = { onLoaded, onFailed };
  const [visible, setVisible] = useState(loading === 'eager');
  // A viewport change can request a new candidate after another has succeeded.
  const requestKey = () => activeSrcSet ? `responsive:${image.current?.currentSrc || src}` : src;

  const success = () => {
    const key = requestKey();
    if (settled.current.has(key) || attempted.current.has(key)) return;
    settled.current.add(key);
    setPending(false);
    callbacks.current.onLoaded(src);
  };
  const failure = () => {
    const key = requestKey();
    // During a responsive-source error, currentSrc can still report the previous
    // successful candidate. The native error must still retry the original.
    if (attempted.current.has(key) || (!activeSrcSet && settled.current.has(key))) return;
    attempted.current.add(key);
    // An unavailable generated candidate must still recover through the original.
    if (activeSrcSet) { setPending(true); setResponsive(false); return; }
    const next = preview && src === preview ? primary : fallback;
    if (next && !attempted.current.has(next) && next !== src) {
      setPending(true);
      setSrc(next);
    } else {
      setPending(false);
      callbacks.current.onFailed();
    }
  };
  const matchesSource = (url: string) => [src, ...(activeSrcSet?.split(',').map(candidate => candidate.trim().split(/\s+/)[0]) ?? [])]
    .some(candidate => url === new URL(candidate, document.baseURI).href);
  const handlers = useRef({ success, failure, matchesSource });
  handlers.current = { success, failure, matchesSource };

  useEffect(() => {
    const node = image.current;
    if (!node) return;
    // Load/error events can precede hydration (including browser-cache hits).
    // Read the element's actual result instead of waiting for another event.
    if (node.complete && handlers.current.matchesSource(node.currentSrc)) {
      if (node.naturalWidth > 0) handlers.current.success();
      else handlers.current.failure();
    }
  }, [src, activeSrcSet]);

  useEffect(() => {
    if (visible || !image.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    });
    observer.observe(image.current);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    // A lazy image below the viewport must not time out before being requested.
    if (!visible || !pending) return;
    const timeout = setTimeout(() => handlers.current.failure(), IMAGE_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [src, activeSrcSet, visible, pending]);

  useEffect(() => {
    if (!activeSrcSet || pending) return;
    let frame = 0;
    let disposed = false;
    // Chromium can fail a new srcset candidate on resize without an error event.
    // Check only previously loaded images, after responsive selection has run.
    const checkResizedSource = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          const node = image.current;
          if (!node) return;
          void node.decode().catch(() => {
            if (!disposed && node === image.current && node.complete && !node.naturalWidth) handlers.current.failure();
          });
        });
      });
    };
    window.addEventListener('resize', checkResizedSource, { passive: true });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', checkResizedSource);
    };
  }, [activeSrcSet, pending]);

  return <>
    {pending && showLoadingIndicator && <div data-image-loading aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-ui-tint z-20">
      <Loader2 className="w-8 h-8 text-wareongo-blue animate-spin motion-reduce:animate-none" />
    </div>}
    <img {...props} ref={image} src={src} srcSet={activeSrcSet} data-raw={primary} data-fallback={fallback ?? ''} loading={loading} aria-busy={pending}
      onLoad={(event) => {
        if (handlers.current.matchesSource(event.currentTarget.currentSrc)) handlers.current.success();
      }}
      onError={(event) => {
        // currentSrc can be empty while the browser replaces a responsive source.
        if (activeSrcSet || handlers.current.matchesSource(event.currentTarget.currentSrc)) handlers.current.failure();
      }} />
  </>;
}
