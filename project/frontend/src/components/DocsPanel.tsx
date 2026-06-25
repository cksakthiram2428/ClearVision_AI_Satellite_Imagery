import React, { useState, useEffect } from 'react';

interface DocsPanelProps {
  onClose: () => void;
}

const DocsPanel: React.FC<DocsPanelProps> = ({ onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">


      {/* Left backdrop clickable area */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-500 ease-out ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
        onClick={handleClose}
      />

      {/* Sliding Panel */}
      <div
        className={`relative z-20 w-full max-w-2xl h-full bg-black/20 flex flex-col shadow-2xl transform transition-all duration-500 ${
          isClosing
            ? 'translate-x-full opacity-0'
            : 'translate-x-0 opacity-100'
        }`}
        style={{
          borderLeft: '1px solid rgba(255,255,255,0.12)',
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform, opacity',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Documentation</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto px-8 py-8 space-y-8 text-gray-300"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}
        >
          {/* Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
              Generative AI-Based Cloud Removal for LISS-IV Satellite Imagery
            </h1>
            <div className="h-0.5 w-16 bg-gradient-to-r from-white/60 to-transparent rounded-full mt-4" />
          </div>

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">01</span>
              <h2 className="text-lg font-semibold text-white">Introduction</h2>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              Cloud cover is one of the biggest challenges in optical satellite imaging, especially in the North Eastern Region of India where cloudy conditions persist for several months. This project aims to develop a Generative AI-based system that removes clouds from LISS-IV satellite images and reconstructs the hidden regions to produce clear and analysis-ready images.
            </p>
          </section>

          <div className="border-t border-white/5" />

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">02</span>
              <h2 className="text-lg font-semibold text-white">Proposed Approach</h2>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              The system first collects satellite images from LISS-IV and Sentinel satellites. Cloud regions are identified using cloud masks, and the images are preprocessed and divided into smaller patches. A Hybrid CNN-Transformer model is then used to reconstruct cloud-covered areas, and the reconstructed patches are combined to generate the final cloud-free image.
            </p>
          </section>

          <div className="border-t border-white/5" />

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">03</span>
              <h2 className="text-lg font-semibold text-white">Dataset and Model</h2>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              The project mainly uses LISS-IV images along with Sentinel-1 SAR and Sentinel-2 optical data. Additional information from elevation models and land-cover maps is also used. Among several deep learning models studied, the Hybrid CNN-Transformer architecture is selected because it provides better reconstruction quality while maintaining reasonable computational efficiency.
            </p>
          </section>

          <div className="border-t border-white/5" />

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">04</span>
              <h2 className="text-lg font-semibold text-white">Training and Evaluation</h2>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              The model is trained using multiple loss functions to improve image quality and preserve important features. Performance is measured using metrics such as PSNR, SSIM, MAE, and RMSE. The proposed method is also compared with existing approaches to ensure reliable reconstruction results.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['PSNR', 'SSIM', 'MAE', 'RMSE'].map(m => (
                <span key={m} className="text-xs font-mono font-semibold px-3 py-1.5 rounded-full border border-white/15 text-white/60 bg-white/5">
                  {m}
                </span>
              ))}
            </div>
          </section>

          <div className="border-t border-white/5" />

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">05</span>
              <h2 className="text-lg font-semibold text-white">Implementation and Tools</h2>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              The framework is developed using Python and libraries such as PyTorch, GDAL, Rasterio, OpenCV, NumPy, and Matplotlib. The trained model processes satellite images and produces cloud-free GeoTIFF outputs while preserving the original spatial information. The entire project is planned to be completed in about twelve weeks.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Python', 'PyTorch', 'GDAL', 'Rasterio', 'OpenCV', 'NumPy', 'Matplotlib'].map(tool => (
                <span key={tool} className="text-xs font-mono font-medium px-3 py-1.5 rounded-md border border-white/10 text-white/50 bg-white/5">
                  {tool}
                </span>
              ))}
            </div>
          </section>

          <div className="border-t border-white/5" />

          {/* Section 6 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">06</span>
              <h2 className="text-lg font-semibold text-white">Challenges and Expected Outcomes</h2>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              The project faces challenges such as limited training data, differences between SAR and optical images, and computational requirements. These issues are addressed using data augmentation, transfer learning, and optimized training methods. The expected outcome is a high-quality cloud removal system that can improve agricultural monitoring, disaster management, and land-use analysis, with potential applications in ISRO and NRSC operational workflows.
            </p>
          </section>

          <div className="border-t border-white/5" />

          {/* Conclusion */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">✦</span>
              <h2 className="text-lg font-semibold text-white">Conclusion</h2>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              This project proposes an advanced Generative AI framework for removing clouds from LISS-IV satellite imagery. By combining multiple satellite datasets and deep learning techniques, the system aims to provide accurate and cloud-free images that can support various remote sensing applications and enhance geospatial analysis in cloud-prone regions of India.
            </p>
          </section>

          {/* Bottom spacer */}
          <div className="h-8" />
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-white/10 shrink-0">
          <p className="text-xs text-white/20 text-center">ClearVision AI · ISRO Cloud Imagery Challenge</p>
        </div>
      </div>
    </div>
  );
};

export default DocsPanel;
