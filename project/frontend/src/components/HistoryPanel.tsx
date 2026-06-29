import React, { useState } from 'react';
import FadeIn from './FadeIn';
import { API_BASE_URL } from '../config';

export interface JobHistoryItem {
  id: string;
  filename: string;
  date: string;
  tags: string[];
}

interface HistoryPanelProps {
  history: JobHistoryItem[];
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClose }) => {
  const [selectedJob, setSelectedJob] = useState<JobHistoryItem | null>(null);
  const [metrics, setMetrics] = useState<{ psnr: number; ssim: number; sam: number } | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const handleReview = async (job: JobHistoryItem) => {
    setSelectedJob(job);
    setMetrics(null);
    setLoadingMetrics(true);
    try {
      const response = await fetch(`${API_BASE_URL}/metrics/${job.id}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        console.error("Failed to fetch metrics");
      }
    } catch (error) {
      console.error("Error fetching metrics", error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans text-white">
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

      <div className="relative z-10 min-h-screen w-full flex p-4 md:p-8 items-start justify-center bg-black/40 backdrop-blur-md">
        <FadeIn duration={400} className="w-full max-w-7xl">
          <div className="bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl w-full flex flex-col p-6 md:p-12 border border-white/10">

            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
              <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">Process History</h2>
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 border border-white/20 rounded-lg bg-white/5 hover:bg-white/10 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Upload
              </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-12">

              {/* History List */}
              <div className={`flex-1 ${selectedJob ? 'lg:border-r border-white/10 lg:pr-12' : ''}`}>
                {history.length === 0 ? (
                  <div className="text-gray-400 text-center py-20 bg-white/5 rounded-2xl border border-white/20 border-dashed">
                    <p className="text-lg">No previous processes found.</p>
                    <p className="text-sm mt-2 text-gray-500">Go back and upload an image to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((job) => (
                      <div
                        key={job.id}
                        className={`bg-white/5 backdrop-blur-sm border rounded-xl p-5 transition-all hover:shadow-md hover:bg-white/10 ${selectedJob?.id === job.id
                            ? 'border-white ring-1 ring-white shadow-sm bg-white/10'
                            : 'border-white/10 hover:border-white/30'
                          }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-medium text-white truncate max-w-full sm:max-w-md">{job.filename}</h3>
                            <p className="text-sm text-gray-400 mt-1">{new Date(job.date).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => handleReview(job)}
                            className={`text-sm px-6 py-2 rounded-lg transition-colors font-medium shadow-sm ${selectedJob?.id === job.id
                                ? 'bg-white text-black'
                                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                              }`}
                          >
                            Review
                          </button>
                        </div>

                        {job.tags && job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {job.tags.map(tag => (
                              <span key={tag} className="text-[10px] uppercase tracking-wider bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-md font-semibold border border-white/20 shadow-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-4 font-mono">
                          Job ID: {job.id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Panel */}
              {selectedJob && (
                <div className="w-full lg:w-[400px] flex flex-col shrink-0">
                  <div className="sticky top-4">
                    <h3 className="text-2xl font-light text-white mb-6">Review Details</h3>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Filename</h4>
                      <p className="text-white font-medium break-all mb-6">{selectedJob.filename}</p>

                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Processed On</h4>
                      <p className="text-white font-medium mb-8">{new Date(selectedJob.date).toLocaleString()}</p>

                      <div className="border-t border-white/10 pt-6">
                        <h4 className="text-lg font-medium text-white mb-6">Evaluation Metrics</h4>

                        {loadingMetrics ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="text-sm text-gray-400 animate-pulse font-medium">Fetching metrics from server...</div>
                          </div>
                        ) : metrics ? (
                          <div className="space-y-6">
                            <div>
                              <div className="flex justify-between text-sm mb-2 font-medium">
                                <span className="text-gray-300">PSNR</span>
                                <span className="text-green-400 font-mono">{metrics.psnr.toFixed(2)} dB</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full shadow-sm" style={{ width: `${Math.min((metrics.psnr / 40) * 100, 100)}%` }}></div>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">Peak Signal-to-Noise Ratio (Higher is better)</p>
                            </div>

                            <div>
                              <div className="flex justify-between text-sm mb-2 font-medium">
                                <span className="text-gray-300">SSIM</span>
                                <span className="text-blue-400 font-mono">{metrics.ssim.toFixed(3)}</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full shadow-sm" style={{ width: `${metrics.ssim * 100}%` }}></div>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">Structural Similarity Index (Closer to 1 is better)</p>
                            </div>

                            <div>
                              <div className="flex justify-between text-sm mb-2 font-medium">
                                <span className="text-gray-300">SAM</span>
                                <span className="text-purple-400 font-mono">{metrics.sam.toFixed(3)}</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-2">
                                {/* Lower is better for SAM, invert width logic roughly for visual */}
                                <div className="bg-purple-500 h-2 rounded-full shadow-sm" style={{ width: `${Math.max(100 - (metrics.sam * 500), 10)}%` }}></div>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">Spectral Angle Mapper (Lower is better)</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                              <a
                                href={`${API_BASE_URL}/download/${selectedJob.id}`}
                                download={`clearvision_${selectedJob.id}.tif`}
                                className="w-full bg-white text-black font-medium px-6 py-3 rounded-xl transition-colors hover:bg-gray-200 shadow-md flex items-center justify-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                  <polyline points="7 10 12 15 17 10"></polyline>
                                  <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download Cleaned Image
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/50 p-4 rounded-xl">
                            Failed to load metrics. The server might be unreachable.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default HistoryPanel;
