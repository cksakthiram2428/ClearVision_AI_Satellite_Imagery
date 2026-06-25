import React, { useRef, useState, useEffect } from 'react';

interface UploadPanelProps {
  onClose: () => void;
  onUploadSuccess: (jobId: string, tags: string[], filename: string) => void;
}

const AVAILABLE_TAGS = ['Urban', 'Forest', 'Agriculture', 'Water Body', 'Mountains', 'Cloud Heavy'];

const UploadPanel: React.FC<UploadPanelProps> = ({ onClose, onUploadSuccess }) => {
  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Handle escape key
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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      onUploadSuccess(data.job_id, selectedTags, file.name);
      handleClose();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Check if backend is running and CORS is enabled.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay on the left side */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-500 ease-out ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`relative z-20 w-full max-w-md h-full bg-black/40 border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">New Process</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <h3 className="text-sm font-medium text-white mb-3">1. Select Terrain Tags</h3>
            <p className="text-xs text-gray-400 mb-4">Adding tags helps us track and evaluate the model's performance on different geographical features.</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${selectedTags.includes(tag)
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-white/5 text-gray-300 border-white/20 hover:border-white/40 hover:bg-white/10'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-white mb-4">2. Upload GeoTIFF</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".tif,.tiff"
              className="hidden"
            />

            <div
              onClick={handleUploadClick}
              className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
                ${uploading
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40'
                }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm font-medium text-blue-400">Uploading & Processing...</p>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  <p className="text-sm font-medium text-white mb-1">Click to browse files</p>
                  <p className="text-xs text-gray-400">Supports .tif and .tiff up to 100MB</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPanel;
