import React from 'react';
import { X, ExternalLink, Video } from 'lucide-react';

export default function VideoModal({ isOpen, onClose, videoId, problemTitle }) {
  if (!isOpen || !videoId) return null;

  // Support both Vimeo and YouTube IDs
  const isVimeo = videoId.includes('?') || /^\d+/.test(videoId);
  const embedUrl = isVimeo 
    ? `https://player.vimeo.com/video/${videoId}`
    : `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  const watchUrl = isVimeo
    ? `https://vimeo.com/${videoId.split('?')[0]}`
    : `https://www.youtube.com/watch?v=${videoId}`;
  const platformName = isVimeo ? 'Vimeo' : 'YouTube';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Walkthrough: {problemTitle}
              </h3>
              <p className="text-[11px] text-slate-400">Interactive Walkthrough & Architecture Breakdown</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              <span>Watch on {platformName}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Embed */}
        <div className="relative w-full pb-[56.25%] bg-black">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={`Video solution for ${problemTitle}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

      </div>
    </div>
  );
}
