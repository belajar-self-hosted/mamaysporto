import React from 'react';
import { PageView } from '../types';
import { soundFx } from '../utils/audio';
import { ArrowUp, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageView) => void;
  onOpenStartProject: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenStartProject }) => {
  const scrollToTop = () => {
    soundFx.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="main-footer"
      className="w-full bg-[#1d1b15] text-[#fff9ed] border-t-4 border-[#1d1b15] p-8 sm:p-12 md:p-16 relative overflow-hidden"
    >
      {/* Background graphic stripe */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-[#b7102a]" />

      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Top Footer Tier */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#fff9ed]/20 pb-10 gap-8">
          
          {/* Slanted SUMUR Display Logo */}
          <div className="flex flex-col">
            <span className="font-label-caps text-xs text-[#8cf5e4] uppercase tracking-widest block mb-2">
              AVANT-GARDE SURREALIST STUDIO
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('HOME');
              }}
              className="text-left font-display-xl text-6xl sm:text-8xl md:text-9xl text-[#b7102a] tracking-tighter uppercase leading-none rotate-[-2deg] hover:rotate-0 hover:text-white transition-all cursor-pointer drop-shadow-[4px_4px_0px_#fff9ed]"
            >
              SUMUR
            </button>
          </div>

          {/* Quick Nav & Links */}
          <div className="flex flex-wrap gap-8 sm:gap-12">
            <div>
              <span className="font-label-caps text-xs text-[#8cf5e4] uppercase font-bold block mb-3">
                SECTORS
              </span>
              <ul className="space-y-2 font-label-caps text-xs">
                {(['HOME', 'ABOUT', 'SERVICES', 'CONTACT', 'LABS'] as PageView[]).map((page) => (
                  <li key={page}>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onNavigate(page);
                        scrollToTop();
                      }}
                      className="text-[#ede7dd] hover:text-[#b7102a] hover:underline underline-offset-4 cursor-pointer"
                    >
                      {page}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-label-caps text-xs text-[#8cf5e4] uppercase font-bold block mb-3">
                BROADCASTS
              </span>
              <ul className="space-y-2 font-label-caps text-xs text-[#ede7dd]">
                <li>
                  <a href="#instagram" onClick={(e) => { e.preventDefault(); soundFx.playClick(); }} className="hover:text-[#b7102a] hover:underline">
                    INSTAGRAM [@SUMURCREATIVE]
                  </a>
                </li>
                <li>
                  <a href="#behance" onClick={(e) => { e.preventDefault(); soundFx.playClick(); }} className="hover:text-[#b7102a] hover:underline">
                    BEHANCE [SUMUR LABS]
                  </a>
                </li>
                <li>
                  <a href="#twitter" onClick={(e) => { e.preventDefault(); soundFx.playClick(); }} className="hover:text-[#b7102a] hover:underline">
                    X / TWITTER [@SUMUR_VOID]
                  </a>
                </li>
                <li>
                  <a href="#spotify" onClick={(e) => { e.preventDefault(); soundFx.playClick(); }} className="hover:text-[#b7102a] hover:underline">
                    SONIC TAPES [SPOTIFY]
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer Tier */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-[#ede7dd]/70 gap-4">
          <div>
            © 2026 SUMUR CREATIVE • BEYOND THE GRID • NO RIGHTS RESERVED FOR MEDIOCRITY.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenStartProject();
              }}
              className="bg-[#b7102a] text-white px-3 py-1 border border-white font-label-caps text-[10px] uppercase font-bold hover:bg-[#8cf5e4] hover:text-[#1d1b15] transition-colors"
            >
              COMMISSION SQUAD
            </button>

            <button
              onClick={scrollToTop}
              className="p-2 border border-[#fff9ed] bg-[#1d1b15] text-[#fff9ed] hover:bg-[#b7102a] transition-colors cursor-pointer"
              title="Return to summit"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
