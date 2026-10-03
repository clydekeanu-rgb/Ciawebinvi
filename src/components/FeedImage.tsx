import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, AlertCircle, RefreshCw } from 'lucide-react';

interface FeedImageProps {
  src: string;
  alt: string;
  onExpand?: () => void;
  priority?: boolean;
}

export const FeedImage: React.FC<FeedImageProps> = ({
  src,
  alt,
  onExpand,
  priority = false
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const autoRetryCountRef = useRef(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Compute current image URL with cache-busting query param on retry
  const currentSrc = retryCount > 0
    ? (src.includes('?') ? `${src}&retry=${retryCount}` : `${src}?retry=${retryCount}`)
    : src;

  // Handle cached images already complete before/during hydration
  useEffect(() => {
    if (imgRef.current?.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setStatus('loaded');
      } else {
        handleError();
      }
    }
  }, [currentSrc]);

  const handleError = () => {
    // Automatically retry up to 2 times with a short delay (Google Drive rate-limit protection)
    if (autoRetryCountRef.current < 2) {
      autoRetryCountRef.current += 1;
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setStatus('loading');
      }, 1500);
    } else {
      setStatus('error');
    }
  };

  const handleManualRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    autoRetryCountRef.current = 0;
    setStatus('loading');
    setRetryCount((prev) => prev + 1);
  };

  const handleContainerClick = () => {
    if (status === 'loaded' && onExpand) {
      onExpand();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`relative w-full aspect-4/3 sm:aspect-16/10 bg-slate-100 overflow-hidden select-none ${
        status === 'loaded' ? 'cursor-pointer group' : ''
      }`}
    >
      {/* 1. Loading Skeleton with Shimmer Animation */}
      {status === 'loading' && (
        <div
          className="absolute inset-0 feed-skeleton z-10 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* 2. Error Fallback Card with Manual Retry */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center bg-slate-100 text-slate-500 z-10">
          <AlertCircle className="w-8 h-8 text-slate-400 stroke-[1.5]" />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-700">Image unavailable</p>
            <p className="text-[10px] text-slate-400">Could not load this party photo</p>
          </div>
          <button
            type="button"
            onClick={handleManualRetry}
            className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-95 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 3. Feed Image with 300ms Fade-in */}
      <img
        ref={imgRef}
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        referrerPolicy="no-referrer"
        onLoad={() => setStatus('loaded')}
        onError={handleError}
        className={`w-full h-full object-cover group-hover:scale-102 transition-all duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 4. Tap-to-Expand Icon Overlay (only visible & clickable once image has loaded) */}
      {status === 'loaded' && (
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-xs text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};
