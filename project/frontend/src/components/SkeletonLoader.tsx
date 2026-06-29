import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface PageSkeletonProps {
  onRetry?: () => void;
}

interface JobSkeletonProps {
  progress?: number;
  eta?: string;
  error?: string;
  onRetry?: () => void;
}

const shimmerStyle = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

export const PageSkeleton = ({ onRetry }: PageSkeletonProps) => {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setIsReducedMotion(mediaQuery.matches);
    updateMotion();
    mediaQuery.addEventListener('change', updateMotion);

    const readyTimer = window.setTimeout(() => setPhase('ready'), 250);
    const fallbackTimer = window.setTimeout(() => setPhase('fallback'), 10000);

    return () => {
      mediaQuery.removeEventListener('change', updateMotion);
      window.clearTimeout(readyTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (phase === 'ready') {
      headingRef.current?.focus();
    }
  }, [phase]);

  const content = (
    <div className="min-h-screen bg-black text-white" role="status" aria-live="polite">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_40%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
          <div className="h-6 w-32 rounded-full bg-white/10" />
          <div className="flex gap-3">
            <div className="h-8 w-20 rounded-full bg-white/10" />
            <div className="h-8 w-24 rounded-full bg-white/10" />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl sm:p-8">
          <div className="mb-6 h-10 w-3/4 rounded-full bg-white/10" />
          <div className="mb-4 h-4 w-full rounded-full bg-white/10" />
          <div className="mb-4 h-4 w-5/6 rounded-full bg-white/10" />
          <div className="h-4 w-2/3 rounded-full bg-white/10" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="mb-4 h-24 rounded-2xl bg-white/10" />
              <div className="mb-3 h-4 w-3/4 rounded-full bg-white/10" />
              <div className="mb-2 h-3 w-full rounded-full bg-white/10" />
              <div className="mb-2 h-3 w-5/6 rounded-full bg-white/10" />
              <div className="h-7 w-20 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (phase === 'fallback') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 py-8 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold">Server not responding.</h1>
          <p className="mt-3 text-sm text-gray-300">Check backend connectivity and try again.</p>
          {onRetry ? (
            <button onClick={onRetry} className="mt-6 rounded-2xl bg-white px-4 py-2 font-medium text-black transition hover:bg-gray-200">
              Retry
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <style>{shimmerStyle}</style>
      {isReducedMotion ? (
        content
      ) : (
        <div className="relative overflow-hidden">
          {content}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmer 1.2s linear infinite' }} />
        </div>
      )}
    </div>
  );
};

export const JobSkeleton = ({ progress = 0, eta = 'a few moments', error, onRetry }: JobSkeletonProps) => {
  const stages = ['Uploading', 'Queued', 'Processing', 'Generating Output'];
  const activeIndex = Math.min(stages.length - 1, Math.round(progress / 25));

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 py-8 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold">Processing failed</h2>
          <p className="mt-3 text-sm text-gray-300">{error}</p>
          {onRetry ? (
            <button onClick={onRetry} className="mt-6 rounded-2xl bg-white px-4 py-2 font-medium text-black transition hover:bg-gray-200">
              Retry
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Job pipeline</p>
            <h2 className="mt-2 text-2xl font-semibold">Processing satellite imagery</h2>
          </div>
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
            {Math.round(progress)}%
          </div>
        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="mb-6 flex items-center justify-between text-sm text-gray-300">
          <span>Estimated time: {eta}</span>
          <span className="text-cyan-300">Live processing</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {stages.map((stage, index) => {
            const isActive = index <= activeIndex;
            return (
              <motion.div
                key={stage}
                layout
                className={`rounded-2xl border px-4 py-3 text-sm transition ${isActive ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_0_24px_rgba(34,211,238,0.16)]' : 'border-white/10 bg-black/20 text-gray-300'}`}
              >
                {stage}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default PageSkeleton;
