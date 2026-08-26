import React, { useState } from 'react';
import { PageView } from '../types';
import { soundFx } from '../utils/audio';
import { Volume2, VolumeX, Menu, X, Sparkles } from 'lucide-react';

interface TopNavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  onOpenStartProject: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenStartProject,
}) => {
  const [audioActive, setAudioActive] = useState<boolean>(soundFx.enabled);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleNav = (page: PageView) => {
    soundFx.playClick();
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSound = () => {
    const newState = soundFx.toggleSound();
    setAudioActive(newState);
  };

  return (
    <nav
      id="main-top-navbar"
      className="sticky top-0 z-50 w-full bg-[#fff9ed] border-b-4 border-[#1d1b15] shadow-[8px_8px_0px_0px_rgba(29,27,21,1)]"
    >
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 sm:px-8 md:px-10 py-3 md:py-4 gap-3 md:gap-6">
        
        {/* Brand Logo */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <button
            id="nav-logo-btn"
            onClick={() => handleNav('HOME')}
            className="text-left font-display-lg text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1d1b15] tracking-tighter uppercase font-bold hover:text-[#b7102a] transition-colors leading-none"
          >
            SUMUR CREATIVE
          </button>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="mobile-audio-toggle"
              onClick={handleToggleSound}
              className="p-2 border-2 border-[#1d1b15] bg-[#ede7dd] hover:bg-[#b7102a] hover:text-white transition-colors"
              title={audioActive ? 'Mute analog tactile audio' : 'Enable tactile audio'}
            >
              {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-[#1d1b15] bg-[#b7102a] text-white shadow-[2px_2px_0px_0px_#1d1b15]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {(['HOME', 'ABOUT', 'SERVICES', 'CONTACT'] as PageView[]).map((page) => {
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                id={`nav-link-${page.toLowerCase()}`}
                onClick={() => handleNav(page)}
                className={`font-label-caps text-sm tracking-wider uppercase transition-all duration-100 cursor-pointer ${
                  isActive
                    ? 'text-[#b7102a] font-bold underline decoration-4 underline-offset-8 transform translate-y-[-2px]'
                    : 'text-[#1d1b15] hover:text-[#b7102a] hover:translate-x-1 hover:translate-y-1'
                }`}
              >
                {page}
              </button>
            );
          })}

          {/* Labs quick jump */}
          <button
            id="nav-link-labs"
            onClick={() => handleNav('LABS')}
            className={`font-label-caps text-xs px-2 py-1 border-2 border-[#1d1b15] uppercase flex items-center gap-1 transition-all ${
              currentPage === 'LABS'
                ? 'bg-[#1d1b15] text-[#fff9ed]'
                : 'bg-[#ede7dd] text-[#1d1b15] hover:bg-[#006a60] hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>LABS</span>
          </button>
        </div>

        {/* Right Action buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Audio toggle button */}
          <button
            id="desktop-audio-toggle"
            onClick={handleToggleSound}
            className="p-2 border-2 border-[#1d1b15] bg-[#ede7dd] hover:bg-[#b7102a] hover:text-white transition-colors shadow-[2px_2px_0px_0px_#1d1b15] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            title={audioActive ? 'Mute analog tactile audio' : 'Enable tactile audio'}
          >
            {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-60" />}
          </button>

          {/* Start Project CTA */}
          <button
            id="nav-start-project-btn"
            onClick={() => {
              soundFx.playClick();
              onOpenStartProject();
            }}
            className="border-2 border-[#1d1b15] px-5 py-2 font-label-caps text-xs md:text-sm text-white bg-[#b7102a] shadow-[4px_4px_0px_0px_rgba(29,27,21,1)] hover:bg-[#1d1b15] hover:text-[#fff9ed] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-100 cursor-pointer uppercase font-bold"
          >
            START PROJECT
          </button>
        </div>
      </div>

      {/* Mobile Accordion Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-t-2 border-[#1d1b15] bg-[#ede7dd] p-4 flex flex-col gap-3 animate-fadeIn"
        >
          {(['HOME', 'ABOUT', 'SERVICES', 'CONTACT', 'LABS'] as PageView[]).map((page) => (
            <button
              key={page}
              onClick={() => handleNav(page)}
              className={`text-left font-headline-lg text-xl uppercase p-2 border-2 border-[#1d1b15] shadow-[2px_2px_0px_0px_#1d1b15] ${
                currentPage === page
                  ? 'bg-[#b7102a] text-white'
                  : 'bg-[#fff9ed] text-[#1d1b15]'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenStartProject();
            }}
            className="w-full mt-2 border-2 border-[#1d1b15] p-3 font-headline-lg text-lg text-white bg-[#b7102a] shadow-[4px_4px_0px_0px_#1d1b15] uppercase"
          >
            START PROJECT →
          </button>
        </div>
      )}
    </nav>
  );
};
