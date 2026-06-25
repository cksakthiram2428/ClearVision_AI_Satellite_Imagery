import React, { useState, useEffect } from 'react';
import AnimatedHeading from './AnimatedHeading';
import FadeIn from './FadeIn';
import HistoryPanel, { type JobHistoryItem } from './HistoryPanel';
import UploadPanel from './UploadPanel';
import DocsPanel from './DocsPanel';

const Hero: React.FC = () => {
  const [jobId, setJobId] = useState<string | null>(null);

  // Panels state
  const [jobHistory, setJobHistory] = useState<JobHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  // Compute if any panel is open for blur effect
  const isAnyPanelOpen = showUpload || showDocs || showHistory;

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('isro_job_history');
    if (saved) {
      try {
        setJobHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const handleUploadSuccess = (newJobId: string, tags: string[], filename: string) => {
    setJobId(newJobId);

    // Save to history
    const newJob: JobHistoryItem = {
      id: newJobId,
      filename: filename,
      date: new Date().toISOString(),
      tags: [...tags]
    };
    const newHistory = [newJob, ...jobHistory];
    setJobHistory(newHistory);
    localStorage.setItem('isro_job_history', JSON.stringify(newHistory));
  };

  return (
    <>
      {/* Main content — blurs when any panel is open */}
      <div className={`relative w-full text-white font-sans transition-all duration-300 ${isAnyPanelOpen ? 'blur-md' : ''}`}>
        {/* Background Video - Fixed so it stays while scrolling */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4" type="video/mp4" />
        </video>

        {/* Hero Section */}
        <div className="min-h-screen flex flex-col relative z-10">
          {/* Navbar Wrapper */}
          <div className="px-6 md:px-12 lg:px-16 pt-6">
            <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
              <div className="text-2xl font-semibold tracking-tight">ClearVision AI</div>
              <div className="hidden md:flex items-center gap-8 text-sm">
                <a href="#features" className="transition-colors hover:text-gray-300">Features</a>
                <a href="#technology" className="transition-colors hover:text-gray-300">Technology</a>
                <a href="#about" className="transition-colors hover:text-gray-300">About Model</a>
                <button
                  onClick={() => setShowHistory(true)}
                  className="transition-colors hover:text-white text-gray-300 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  View History
                </button>
              </div>
              <button
                onClick={() => setShowHistory(true)}
                className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 md:hidden"
              >
                History
              </button>
            </nav>
          </div>

          {/* Hero Content Wrapper */}
          <div className="flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16">
            <div className="lg:grid lg:grid-cols-2 lg:items-end gap-8">

              {/* Left Column */}
              <div className="pointer-events-auto">
                <AnimatedHeading
                  text={"Generative AI-Based\nCloud Removal for \nLISS–IV Satellite Imagery"}
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4"
                  style={{ letterSpacing: '-0.04em' }}
                />

                <FadeIn delay={800} duration={1000}>
                  <p className="text-base md:text-lg text-gray-300 mb-10 max-w-xl">
                    Restore LISS-IV GeoTIFF images by removing cloud cover using our advanced ML model.
                  </p>
                </FadeIn>

                <FadeIn delay={1200} duration={1000}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-4 items-center">
                      <button
                        onClick={() => setShowUpload(true)}
                        className="bg-white text-black px-8 py-3 rounded-lg font-medium transition-colors hover:bg-gray-200 flex items-center gap-2 shadow-lg shadow-white/10"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        New Process
                      </button>

                      <button
                        onClick={() => setShowHistory(true)}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white hover:text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg shadow-black/50"
                      >
                        Process History
                      </button>
                    </div>
                    {jobId && (
                      <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 px-4 py-2 rounded-lg inline-block self-start mt-2">
                        Success! Image uploaded to job: {jobId}
                      </div>
                    )}
                  </div>
                </FadeIn>
              </div>

              {/* Right Column */}
              <div className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0 pointer-events-auto">
                <FadeIn delay={1400} duration={1000}>
                  <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                    <span className="text-lg md:text-xl lg:text-2xl font-light">
                      Revealing what clouds conceal
                    </span>
                  </div>
                </FadeIn>
              </div>

            </div>
          </div>
        </div>

        {/* Scrollable Content Sections */}
        <div className="relative z-10 bg-black/60 backdrop-blur-xl border-t border-white/10">

          {/* Features Section */}
          <section id="features" className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl md:text-5xl font-light mb-4">Advanced Cloud Removal</h2>
              <p className="text-gray-400 max-w-2xl text-lg">Our deep learning pipeline accurately reconstructs satellite imagery obscured by clouds and shadows, revealing the critical ground truth underneath.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                </div>
                <h3 className="text-xl font-medium mb-3">LISS-IV Optimized</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Specifically trained on ISRO's high-resolution LISS-IV sensor data, ensuring the preservation of essential spectral signatures and spatial clarity.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </div>
                <h3 className="text-xl font-medium mb-3">Instant Evaluation</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Quantitative metrics including PSNR, SSIM, and SAM are generated immediately, providing objective confirmation of the reconstruction quality.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <h3 className="text-xl font-medium mb-3">Fast Inference</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Built on a highly optimized FastAPI backend utilizing Celery workers, allowing for quick processing of large GeoTIFF files without locking up the UI.</p>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-24 px-6 md:px-12 lg:px-16 border-t border-white/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1">
                <h2 className="text-3xl md:text-5xl font-light mb-6">Generative Adversarial Networks</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  The core of ClearVision AI relies on a custom GAN architecture. The generator learns to synthesize the missing information obscured by clouds, while the discriminator ensures the generated imagery is indistinguishable from true, cloud-free optical captures.
                </p>
                <div className="flex gap-4 mt-8">
                  <button 
                    onClick={() => setShowDocs(true)}
                    className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200"
                  >
                    Project Summary
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-3xl aspect-square flex items-center justify-center p-8 overflow-hidden">
                <img src="/model-architecture.png" alt="Model Architecture" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 px-6 text-center border-t border-white/10 text-gray-500 text-sm">
            <p>ISRO Cloud Imagery Challenge &copy; {new Date().getFullYear()}</p>
          </footer>

        </div>
      </div>

      {/* Panels rendered OUTSIDE the blur wrapper so they stay crisp */}
      {showHistory && (
        <HistoryPanel
          history={jobHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showUpload && (
        <UploadPanel
          onClose={() => setShowUpload(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {showDocs && (
        <DocsPanel onClose={() => setShowDocs(false)} />
      )}
    </>
  );
};

export default Hero;
