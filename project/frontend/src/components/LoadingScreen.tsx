import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onFinish: () => void;
}

const LoadingScreen = ({ onFinish }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 8));
    }, 120);

    const finishTimer = window.setTimeout(() => {
      onFinish();
    }, 1400);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">ClearVision AI</p>
            <h2 className="mt-2 text-2xl font-semibold">Preparing the experience</h2>
          </div>
          <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-gray-200">
            {progress}%
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-5 text-sm leading-relaxed text-gray-400">
          Optimizing the interface for desktop and mobile screens while loading your cloud-removal workspace.
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
