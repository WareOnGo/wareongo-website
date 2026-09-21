import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

const IMAGE_TIMEOUT_MS = 15_000;

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'onLoad' | 'onError'> & {
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
export default function WarehousePhoto({ primary, initialSrc, preview, fallback, onLoaded, onFailed, loading = 'eager', showLoadingIndicator = true, ...props }: Props) {
  const [src, setSrc] = useState(initialSrc !== primary ? initialSrc : preview ?? initialSrc);
  const [pending, setPending] = useState(true);
  const image = useRef<HTMLImageElement>(null);
  const attempted = useRef(new Set<string>());
  const settled = useRef(new Set<string>());
  const callbacks = useRef({ onLoaded, onFailed });
  callbacks.current = { onLoaded, onFailed };
  const [visible, setVisible] = useState(loading === 'eager');

  const success = () => {
    if (settled.current.has(src) || attempted.current.has(src)) return;
    settled.current.add(src);
    setPending(false);
    callbacks.current.onLoaded(src);
  };
  const failure = () => {
    if (attempted.current.has(src) || settled.current.has(src)) return;
    attempted.current.add(src);
    const next = preview && src === preview ? primary : fallback;
    if (next && !attempted.current.has(next) && next !== src) {
      setPending(true);
      setSrc(next);
    } else {
      setPending(false);
      callbacks.current.onFailed();
    }
  };
  const handlers = useRef({ success, failure });
  handlers.current = { success, failure };

  useEffect(() => {
    const node = image.current;
    if (!node) return;
    // Load/error events can precede hydration (including browser-cache hits).
    // Read the element's actual result instead of waiting for another event.
    if (node.complete && node.currentSrc === new URL(src, document.baseURI).href) {
      if (node.naturalWidth > 0) handlers.current.success();
      else handlers.current.failure();
    }
  }, [src]);

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
  }, [src, visible, pending]);

  return <>
    {pending && showLoadingIndicator && <div data-image-loading aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-wareongo-blue/5 z-20">
      <Loader2 className="w-8 h-8 text-wareongo-blue animate-spin motion-reduce:animate-none" />
    </div>}
    <img {...props} ref={image} src={src} data-raw={primary} data-fallback={fallback ?? ''} loading={loading} aria-busy={pending}
      onLoad={(event) => {
        if (event.currentTarget.currentSrc === new URL(src, document.baseURI).href) handlers.current.success();
      }}
      onError={(event) => {
        if (event.currentTarget.currentSrc === new URL(src, document.baseURI).href) handlers.current.failure();
      }} />
  </>;
}
