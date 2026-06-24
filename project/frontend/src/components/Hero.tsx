import React, { useRef, useState } from 'react';
import AnimatedHeading from './AnimatedHeading';
import FadeIn from './FadeIn';

const Hero: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      setJobId(data.job_id);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Check if backend is running and CORS is enabled.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden bg-black text-white font-sans">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4" type="video/mp4" />
      </video>

      {/* Navbar Wrapper */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 pt-6">
        <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
          <div className="text-2xl font-semibold tracking-tight">VEX</div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#" className="transition-colors hover:text-gray-300">Story</a>
            <a href="#" className="transition-colors hover:text-gray-300">Investing</a>
            <a href="#" className="transition-colors hover:text-gray-300">Building</a>
            <a href="#" className="transition-colors hover:text-gray-300">Advisory</a>
          </div>
          <button className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100">
            Start a Chat
          </button>
        </nav>
      </div>

      {/* Hero Content Wrapper */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:items-end gap-8">
          
          {/* Left Column */}
          <div className="pointer-events-auto">
            <AnimatedHeading
              text={"ISRO Cloud Removal\nClear satellite imagery."}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4"
              style={{ letterSpacing: '-0.04em' }}
            />
            
            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-5 max-w-xl">
                Upload your LISS-IV GeoTIFF images to remove cloud cover using our advanced ML model.
              </p>
            </FadeIn>
            
            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".tif,.tiff" 
                    className="hidden" 
                  />
                  <button 
                    onClick={handleUploadClick}
                    disabled={uploading}
                    className="bg-white text-black px-8 py-3 rounded-lg font-medium transition-colors hover:bg-gray-100 disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload GeoTIFF"}
                  </button>
                  {jobId && (
                    <button 
                      onClick={() => alert(`Prediction started for Job ID: ${jobId}`)}
                      className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium transition-colors hover:bg-white hover:text-black"
                    >
                      Process Image
                    </button>
                  )}
                </div>
                {jobId && (
                  <div className="text-sm text-green-400">
                    Success! Job ID: {jobId}
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
                  Upload. Process. Analyze.
                </span>
              </div>
            </FadeIn>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Hero;
