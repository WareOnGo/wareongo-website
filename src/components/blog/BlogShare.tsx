import { useEffect, useRef, useState } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';
// Lossless WebP of the official [in] asset: https://brand.linkedin.com/downloads
import linkedinLogo from '@/assets/social/linkedin.webp';

export default function BlogShare({ url, title }: { url: string; title: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 4000);
  };
  return (
    <div className="blog-share" role="group" aria-label="Share this article">
      <span className="ui-label">Share</span>
      <div className="blog-share__actions">
        <a className="blog-share__button blog-share__button--brand blog-share__button--linkedin" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn (opens in a new tab)">
          <img className="blog-share__linkedin-logo" src={linkedinLogo} width={32} height={32} alt="" aria-hidden="true" />
        </a>
        <a className="blog-share__button blog-share__button--brand blog-share__button--whatsapp" href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
          target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp (opens in a new tab)">
          <svg className="blog-share__whatsapp-logo" width={28} height={28} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
            <path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8 1 3.9.8a3.3 3.3 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4z" />
          </svg>
        </a>
        <button type="button" className="blog-share__button" onClick={copy} aria-label="Copy article link">
          {status === 'copied' ? <Check size={18} aria-hidden="true" /> : <LinkIcon size={18} aria-hidden="true" />}
        </button>
      </div>
      <span className="blog-share__status" role="status">
        {status === 'copied' ? 'Link copied' : status === 'failed' ? 'Could not copy. Copy the address from your browser.' : ''}
      </span>
    </div>
  );
}
