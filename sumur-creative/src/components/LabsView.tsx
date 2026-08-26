import React, { useState } from 'react';
import { ARTWORKS } from '../data/studioData';
import { soundFx } from '../utils/audio';
import { Sparkles, Sliders, RefreshCw, Layers, Zap, Download } from 'lucide-react';

export const LabsView: React.FC = () => {
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState<number>(0);
  const [glitchIntensity, setGlitchIntensity] = useState<number>(30);
  const [invertColor, setInvertColor] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState<number>(-2);
  const [halftoneMode, setHalftoneMode] = useState<boolean>(true);
  const [customHeading, setCustomHeading] = useState<string>('BEYOND THE GRID');

  const currentArt = ARTWORKS[selectedArtworkIndex];

  const handleRandomize = () => {
    soundFx.playSignalSend();
    setSelectedArtworkIndex(Math.floor(Math.random() * ARTWORKS.length));
    setGlitchIntensity(Math.floor(10 + Math.random() * 80));
    setRotationAngle(Math.floor(-6 + Math.random() * 12));
    setInvertColor(Math.random() > 0.5);
  };

  return (
    <div id="labs-view" className="w-full flex flex-col">
      {/* Header */}
      <section className="p-6 sm:p-10 md:p-14 bg-[#fff9ed] border-b-4 border-[#1d1b15]">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-4">
          <div className="bg-[#a96428] text-white px-4 py-1 border-2 border-[#1d1b15] font-label-caps text-xs rotate-[-2deg] brutalist-shadow-sm font-bold">
            EXPERIMENTAL PLAYGROUND
          </div>
          <h1 className="font-display-xl text-5xl sm:text-7xl md:text-8xl text-[#1d1b15] uppercase tracking-tighter leading-none">
            SURREAL LABS
          </h1>
          <p className="font-body-lg text-base sm:text-lg text-[#1d1b15] max-w-2xl bg-[#ede7dd] p-4 border-2 border-[#1d1b15] brutalist-shadow-sm rotate-1">
            An interactive playground to deconstruct and reassemble the SUMUR CREATIVE visual universe in real time.
          </p>
        </div>
      </section>

      {/* Main Interactive Studio Engine */}
      <section className="p-6 sm:p-10 md:p-14 bg-[#ede7dd] border-b-4 border-[#1d1b15]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Left Canvas: Live Interactive Poster Synthesizer */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div
              id="labs-live-canvas"
              className={`relative w-full max-w-md aspect-[3/4] bg-[#fff9ed] border-4 border-[#1d1b15] brutalist-shadow-xl p-5 flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                invertColor ? 'filter invert' : ''
              }`}
              style={{ transform: `rotate(${rotationAngle}deg)` }}
            >
              {/* Header inside canvas */}
              <div className="z-10 flex justify-between items-start">
                <span className="bg-[#1d1b15] text-[#fff9ed] font-label-caps text-[10px] px-2 py-0.5">
                  EXP // {currentArt.number}
                </span>
                <span className="bg-[#b7102a] text-white font-label-caps text-[10px] px-2 py-0.5">
                  {currentArt.year}
                </span>
              </div>

              {/* Artwork center stage */}
              <div className="my-auto relative w-full aspect-square border-2 border-[#1d1b15] bg-[#1d1b15] overflow-hidden">
                <img
                  src={currentArt.image}
                  alt={currentArt.alt}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    halftoneMode ? 'contrast-125 saturate-150' : 'grayscale'
                  }`}
                  style={{
                    filter: `hue-rotate(${glitchIntensity * 3.6}deg)`,
                  }}
                />
                <div
                  className="absolute inset-0 bg-[#b7102a] mix-blend-color pointer-events-none"
                  style={{ opacity: glitchIntensity / 180 }}
                />
              </div>

              {/* Dynamic Bottom Type */}
              <div className="z-10 border-t-2 border-[#1d1b15] pt-2">
                <h3 className="font-headline-lg text-2xl sm:text-3xl text-[#1d1b15] uppercase tracking-tight leading-none truncate">
                  {customHeading}
                </h3>
                <div className="flex justify-between items-center mt-1 text-[9px] font-mono text-[#5b403f]">
                  <span>{currentArt.title}</span>
                  <span>SUMUR CREATIVE</span>
                </div>
              </div>
            </div>

            <span className="font-mono text-xs text-[#5b403f] mt-4">
              * LIVE INTERACTIVE REAL-TIME GLITCH SYNTHESIZER
            </span>
          </div>

          {/* Right Controls Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#fff9ed] border-4 border-[#1d1b15] brutalist-shadow p-6 space-y-5">
              
              <div className="flex justify-between items-center border-b-2 border-[#1d1b15] pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#b7102a]" />
                  <span className="font-label-caps text-xs uppercase font-bold text-[#1d1b15]">
                    SYNTHESIZER CONTROLS
                  </span>
                </div>
                <button
                  onClick={handleRandomize}
                  className="bg-[#ede7dd] hover:bg-[#8cf5e4] border border-[#1d1b15] px-2.5 py-1 font-label-caps text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> RANDOMIZE
                </button>
              </div>

              {/* Select Source Artwork */}
              <div>
                <label className="font-label-caps text-xs text-[#1d1b15] uppercase font-bold block mb-1.5">
                  SOURCE ARTIFACT:
                </label>
                <select
                  value={selectedArtworkIndex}
                  onChange={(e) => {
                    soundFx.playClick();
                    setSelectedArtworkIndex(Number(e.target.value));
                  }}
                  className="neo-brutalist-input w-full p-2 text-xs font-label-caps uppercase"
                >
                  {ARTWORKS.map((art, idx) => (
                    <option key={art.id} value={idx}>
                      {art.number} — {art.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Headline text */}
              <div>
                <label className="font-label-caps text-xs text-[#1d1b15] uppercase font-bold block mb-1.5">
                  CUSTOM HEADLINE:
                </label>
                <input
                  type="text"
                  value={customHeading}
                  onChange={(e) => setCustomHeading(e.target.value)}
                  maxLength={32}
                  className="neo-brutalist-input w-full p-2 text-xs font-label-caps uppercase"
                />
              </div>

              {/* Hue Glitch Slider */}
              <div>
                <div className="flex justify-between text-xs font-label-caps mb-1">
                  <span>HUE ROTATION MATRIX</span>
                  <span className="font-mono">{glitchIntensity * 3.6}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={glitchIntensity}
                  onChange={(e) => setGlitchIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-[#ede7dd] border border-[#1d1b15] accent-[#b7102a] cursor-pointer"
                />
              </div>

              {/* Spatial Tilt Slider */}
              <div>
                <div className="flex justify-between text-xs font-label-caps mb-1">
                  <span>BRUTALIST TILT</span>
                  <span className="font-mono">{rotationAngle}°</span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(Number(e.target.value))}
                  className="w-full h-2 bg-[#ede7dd] border border-[#1d1b15] accent-[#006a60] cursor-pointer"
                />
              </div>

              {/* Toggle Switches */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setInvertColor(!invertColor);
                  }}
                  className={`p-2 border-2 border-[#1d1b15] font-label-caps text-xs uppercase cursor-pointer ${
                    invertColor ? 'bg-[#1d1b15] text-[#fff9ed] font-bold' : 'bg-[#ede7dd]'
                  }`}
                >
                  {invertColor ? 'INVERTED [ON]' : 'INVERT [OFF]'}
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setHalftoneMode(!halftoneMode);
                  }}
                  className={`p-2 border-2 border-[#1d1b15] font-label-caps text-xs uppercase cursor-pointer ${
                    halftoneMode ? 'bg-[#b7102a] text-white font-bold' : 'bg-[#ede7dd]'
                  }`}
                >
                  {halftoneMode ? 'COLOR HALFORMS' : 'MONOCHROME'}
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
