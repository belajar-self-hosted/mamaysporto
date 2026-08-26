import React from 'react';
import { Artwork } from '../types';
import { soundFx } from '../utils/audio';
import { X, ArrowRight, Layers, Tag, Calendar, Ruler, Sparkles } from 'lucide-react';

interface ArtworkModalProps {
  artwork: Artwork | null;
  onClose: () => void;
  onOpenStartProject: () => void;
}

export const ArtworkModal: React.FC<ArtworkModalProps> = ({
  artwork,
  onClose,
  onOpenStartProject,
}) => {
  if (!artwork) return null;

  return (
    <div
      id="artwork-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1d1b15]/80 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="artwork-modal-content"
        className="relative w-full max-w-4xl bg-[#fff9ed] border-4 border-[#1d1b15] brutalist-shadow-xl p-6 sm:p-8 md:p-10 my-auto text-[#1d1b15]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-artwork-modal"
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 bg-[#b7102a] text-white border-2 border-[#1d1b15] hover:bg-[#1d1b15] transition-colors brutalist-shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Poster Showcase Image */}
          <div className="md:col-span-6 flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] border-4 border-[#1d1b15] brutalist-shadow bg-[#1d1b15] overflow-hidden">
              <img
                src={artwork.image}
                alt={artwork.alt}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-[#fff9ed] text-[#1d1b15] font-label-caps text-xs px-2.5 py-1 border-2 border-[#1d1b15] font-bold">
                {artwork.number}
              </span>
            </div>
          </div>

          {/* Details & Metadata */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-label-caps text-xs bg-[#8cf5e4] text-[#1d1b15] px-2.5 py-0.5 border border-[#1d1b15] font-bold">
                  {artwork.category}
                </span>
                <span className="font-mono text-xs text-[#5b403f]">
                  YEAR: {artwork.year}
                </span>
              </div>

              <h2 className="font-headline-lg text-3xl sm:text-4xl text-[#1d1b15] uppercase tracking-tight leading-none mb-3">
                {artwork.title}
              </h2>

              <p className="font-body-md text-sm text-[#5b403f] font-semibold mb-4">
                {artwork.subtitle}
              </p>

              <p className="font-body-lg text-sm sm:text-base text-[#1d1b15] leading-relaxed border-t-2 border-[#1d1b15] pt-4">
                {artwork.description}
              </p>
            </div>

            {/* Technical metadata */}
            <div className="bg-[#ede7dd] border-2 border-[#1d1b15] p-3 space-y-1.5 text-xs font-body-md">
              {artwork.medium && (
                <div className="flex justify-between">
                  <span className="font-label-caps text-[#5b403f]">MEDIUM:</span>
                  <span className="font-bold text-right">{artwork.medium}</span>
                </div>
              )}
              {artwork.dimensions && (
                <div className="flex justify-between">
                  <span className="font-label-caps text-[#5b403f]">DIMENSIONS:</span>
                  <span className="font-mono">{artwork.dimensions}</span>
                </div>
              )}
              {artwork.client && (
                <div className="flex justify-between">
                  <span className="font-label-caps text-[#5b403f]">COMMISSIONER:</span>
                  <span className="font-bold">{artwork.client}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {artwork.tags.map((t) => (
                <span
                  key={t}
                  className="font-label-caps text-[10px] bg-[#fff9ed] text-[#1d1b15] px-2 py-0.5 border border-[#1d1b15]"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* Commission Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
                onOpenStartProject();
              }}
              className="brutalist-btn bg-[#b7102a] text-white p-3.5 font-headline-lg text-lg uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>COMMISSION SIMILAR DIRECTION</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
