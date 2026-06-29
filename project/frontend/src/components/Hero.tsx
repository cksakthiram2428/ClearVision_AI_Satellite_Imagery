import React, { useState } from 'react';
import AnimatedHeading from './AnimatedHeading';
import FadeIn from './FadeIn';
import HistoryPanel, { type JobHistoryItem } from './HistoryPanel';
import UploadPanel from './UploadPanel';
import DocsPanel from './DocsPanel';
import ProfilePanel from './ProfilePanel';
import { useAuth } from '../context/AuthContext';

interface HeroProps {}

function loadJobHistory(): JobHistoryItem[] {
  const saved = localStorage.getItem('isro_job_history');
  if (!saved) return [];
  try {
    return JSON.parse(saved) as JobHistoryItem[];
  } catch (e) {
    console.error('Failed to parse history', e);
    return [];
  }
}

const Hero: React.FC<HeroProps> = () => {
  const { userName, userEmail } = useAuth();
  const [jobId, setJobId] = useState<string | null>(null);

  // Panels state
  const [jobHistory, setJobHistory] = useState<JobHistoryItem[]>(loadJobHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Compute if any panel is open for blur effect
  const isAnyPanelOpen = showUpload || showDocs || showHistory || showProfile;

  const handleUploadSuccess = (newJobId: string, tags: string[], filename: string) => {
    setJobId(newJobId);

    // Save to history
    const newJob: JobHistoryItem = {
      id: newJobId,
      filename: filename,
      date: new Date().toISOString(),
      tags: [...tags],
    };
    const newHistory = [newJob, ...jobHistory];
    setJobHistory(newHistory);
    localStorage.setItem('isro_job_history', JSON.stringify(newHistory));
  };

  // Avatar initials fallback
  const initials = (userName ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Main content — blurs when any panel is open */}
      <div className={`relative w-full text-white font-sans transition-all duration-300 ${isAnyPanelOpen ? 'blur-md pointer-events-none' : ''}`}>
        {/* Background Video */}
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
          <div className="px-4 sm:px-6 md:px-12 lg:px-16 pt-4 sm:pt-6">
            <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between gap-3">

              {/* Brand */}
              <div className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight shrink-0">ClearVision AI</div>

              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm flex-1 justify-center">
                <a href="#features" className="transition-colors hover:text-gray-300 whitespace-nowrap">Features</a>
                <a href="#technology" className="transition-colors hover:text-gray-300 whitespace-nowrap">Technology</a>
                <a href="#about" className="transition-colors hover:text-gray-300 whitespace-nowrap">About Model</a>
                <button
                  id="nav-history-btn"
                  onClick={() => setShowHistory(true)}
                  className="transition-colors hover:text-white text-gray-300 flex items-center gap-2 whitespace-nowrap min-h-[36px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  View History
                </button>
              </div>

              {/* Right side: profile avatar (always visible) + mobile hamburger */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Profile avatar button */}
                <button
                  id="profile-avatar-btn"
                  onClick={() => setShowProfile(true)}
                  className="relative flex-shrink-0 rounded-full overflow-hidden ring-2 ring-cyan-400/40 hover:ring-cyan-400/70 transition-all duration-200 active:scale-90 shadow-lg"
                  style={{ width: 36, height: 36 }}
                  title={`${userName ?? 'Profile'} — ${userEmail ?? ''}`}
                  aria-label="Open profile panel"
                >
                  <img
                    src="/profile-avatar.png"
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = 'none';
                      const parent = el.parentElement;
                      if (parent && !parent.querySelector('.initials-fallback')) {
                        const fb = document.createElement('div');
                        fb.className = 'initials-fallback w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-indigo-600 text-xs font-bold text-white';
                        fb.textContent = initials;
                        parent.appendChild(fb);
                      }
                    }}
                  />
                </button>

                {/* Mobile hamburger */}
                <button
                  id="mobile-menu-btn"
                  onClick={() => setMobileMenuOpen((value) => !value)}
                  className="md:hidden rounded-lg border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20 active:scale-90 min-h-[36px] min-w-[36px] flex items-center justify-center"
                  aria-label="Toggle navigation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {mobileMenuOpen
                      ? <><path d="M18 6 6 18M6 6l12 12" /></>
                      : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                    }
                  </svg>
                </button>
              </div>
            </nav>

            {/* Mobile dropdown menu */}
            {mobileMenuOpen ? (
              <div className="mt-2 rounded-2xl border border-white/10 bg-black/50 p-3 backdrop-blur-xl md:hidden">
                <div className="flex flex-col gap-1 text-sm text-gray-200">
                  <a
                    href="#features"
                    className="rounded-xl px-4 py-3 transition hover:bg-white/10 min-h-[44px] flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a
                    href="#technology"
                    className="rounded-xl px-4 py-3 transition hover:bg-white/10 min-h-[44px] flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Technology
                  </a>
                  <a
                    href="#about"
                    className="rounded-xl px-4 py-3 transition hover:bg-white/10 min-h-[44px] flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About Model
                  </a>
                  <button
                    id="mobile-history-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowHistory(true);
                    }}
                    className="rounded-xl px-4 py-3 text-left transition hover:bg-white/10 min-h-[44px] flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    View History
                  </button>
                  <button
                    id="mobile-profile-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowProfile(true);
                    }}
                    className="rounded-xl px-4 py-3 text-left transition hover:bg-white/10 min-h-[44px] flex items-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    Profile & Settings
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Hero Content Wrapper */}
          <div className="flex-1 flex flex-col justify-end px-4 sm:px-6 md:px-12 lg:px-16 pb-10 sm:pb-12 lg:pb-16">
            <div className="lg:grid lg:grid-cols-2 lg:items-end gap-8">

              {/* Left Column */}
              <div className="pointer-events-auto">
                <AnimatedHeading
                  text={"Generative AI-Based\nCloud Removal for \nLISS–IV Satellite\nImagery"}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4"
                  style={{ letterSpacing: '-0.04em' }}
                />

                <FadeIn delay={800} duration={1000}>
                  <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-8 sm:mb-10 max-w-xl">
                    Restore LISS-IV GeoTIFF images by removing cloud cover using our advanced ML model.
                  </p>
                </FadeIn>

                <FadeIn delay={1200} duration={1000}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                      <button
                        id="hero-new-process-btn"
                        onClick={() => setShowUpload(true)}
                        className="bg-white text-black px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-base font-medium transition-colors hover:bg-gray-200 active:scale-95 flex items-center gap-2 shadow-lg shadow-white/10 min-h-[48px]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        New Process
                      </button>

                      <button
                        id="hero-history-btn"
                        onClick={() => setShowHistory(true)}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-base font-medium transition-all active:scale-95 shadow-lg shadow-black/50 min-h-[48px]"
                      >
                        Process History
                      </button>
                    </div>

                    {jobId && (
                      <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 px-4 py-2 rounded-lg inline-block self-start mt-1">
                        ✅ Image uploaded — job: <span className="font-mono text-xs">{jobId}</span>
                      </div>
                    )}
                  </div>
                </FadeIn>
              </div>

              {/* Right Column */}
              <div className="flex items-end justify-start lg:justify-end mt-6 lg:mt-0 pointer-events-auto">
                <FadeIn delay={1400} duration={1000}>
                  <div className="liquid-glass border border-white/20 px-5 py-3 rounded-xl">
                    <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-light">
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
          <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-16 max-w-7xl mx-auto">
            <div className="mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-light mb-3 sm:mb-4">Advanced Cloud Removal</h2>
              <p className="text-gray-400 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed">
                Our deep learning pipeline accurately reconstructs satellite imagery obscured by clouds and shadows, revealing the critical ground truth underneath.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
              {[
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                    </svg>
                  ),
                  title: 'LISS-IV Optimized',
                  desc: "Specifically trained on ISRO's high-resolution LISS-IV sensor data, ensuring the preservation of essential spectral signatures and spatial clarity.",
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  ),
                  title: 'Instant Evaluation',
                  desc: 'Quantitative metrics including PSNR, SSIM, and SAM are generated immediately, providing objective confirmation of the reconstruction quality.',
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  ),
                  title: 'Fast Inference',
                  desc: 'Built on a highly optimized FastAPI backend utilizing Celery workers, allowing for quick processing of large GeoTIFF files without locking up the UI.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    {icon}
                  </div>
                  <h3 className="text-base sm:text-xl font-medium mb-2 sm:mb-3">{title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-16 border-t border-white/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16 items-center">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-light mb-4 sm:mb-6">Generative Adversarial Networks</h2>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-6">
                  The core of ClearVision AI relies on a custom GAN architecture. The generator learns to synthesize the missing information obscured by clouds, while the discriminator ensures the generated imagery is indistinguishable from true, cloud-free optical captures.
                </p>
                <div className="flex flex-wrap gap-3 mt-6 sm:mt-8">
                  <button
                    id="about-docs-btn"
                    onClick={() => setShowDocs(true)}
                    className="bg-white text-black px-5 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 active:scale-95 min-h-[44px]"
                  >
                    Project Summary
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-3xl aspect-square flex items-center justify-center p-6 sm:p-8 overflow-hidden">
                <img src="/model-architecture.png" alt="Model Architecture" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-6 sm:py-8 px-4 sm:px-6 text-center border-t border-white/10 text-gray-500 text-xs sm:text-sm">
            <p>ClearVision AI · ISRO Cloud Imagery Challenge &copy; {new Date().getFullYear()}</p>
          </footer>

        </div>
      </div>

      {/* Panels rendered OUTSIDE blur wrapper so they stay crisp */}
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

      {showProfile && (
        <ProfilePanel onClose={() => setShowProfile(false)} />
      )}
    </>
  );
};

export default Hero;
