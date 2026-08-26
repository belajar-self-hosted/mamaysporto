import React, { useState } from 'react';
import { PageView, ServiceItem, Artwork } from '../types';
import { SERVICES, ARTWORKS } from '../data/studioData';
import { soundFx } from '../utils/audio';
import { Sparkles, CheckSquare, Layers, ArrowUpRight, Wand2, Sliders } from 'lucide-react';

interface ServicesViewProps {
  onOpenStartProject: () => void;
  onNavigate: (page: PageView) => void;
  onSelectArtwork: (art: Artwork) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onOpenStartProject,
  onNavigate,
  onSelectArtwork,
}) => {
  // Interactive Alchemy Mixer State
  const [chaosLevel, setChaosLevel] = useState<number>(75);
  const [selectedMedium, setSelectedMedium] = useState<string>('Risograph Halftone');
  const [selectedStructure, setSelectedStructure] = useState<string>('Grid Shattering');

  const mediums = ['Risograph Halftone', '16mm Analog Film', 'Xerox Wheatpaste', 'Surreal Oil Collage'];
  const structures = ['Grid Shattering', 'Brutal Bento Matrix', 'Collage Overload', 'Monolithic Type'];

  const handleMixAlchemy = () => {
    soundFx.playSignalSend();
  };

  return (
    <div id="services-view" className="w-full flex flex-col">
      {/* Header Section */}
      <section className="p-6 sm:p-10 md:p-14 bg-[#fff9ed] border-b-4 border-[#1d1b15]">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-4">
          
          <div className="bg-[#ede7dd] border-2 border-[#1d1b15] px-4 py-1.5 brutalist-shadow-sm rotate-[-1deg]">
            <span className="font-label-caps text-xs text-[#006a60] tracking-widest uppercase font-bold">
              OUR DISCIPLINES & FORMULAS
            </span>
          </div>

          <h1 className="font-display-xl text-5xl sm:text-7xl md:text-8xl text-[#1d1b15] uppercase tracking-tighter leading-none underline decoration-[#b7102a] decoration-4 md:decoration-8 underline-offset-8">
            OUR ALCHEMY
          </h1>

          <p className="font-body-lg text-lg sm:text-xl text-[#1d1b15] max-w-2xl mt-4 bg-[#f3ede2] p-4 border-2 border-[#1d1b15] brutalist-shadow-sm rotate-1">
            Transforming raw concepts into visceral experiences. We dismantle conventional industry formulas and rebuild brand worlds from pure tactile emotion.
          </p>
        </div>
      </section>

      {/* 3 Core Service Blocks */}
      <section className="p-6 sm:p-10 md:p-14 bg-[#ede7dd] border-b-4 border-[#1d1b15] space-y-12 md:space-y-16">
        <div className="max-w-6xl mx-auto space-y-12 md:space-y-16">
          
          {SERVICES.map((service, index) => {
            const isEven = index % 2 === 1;

            return (
              <div
                key={service.number}
                id={`service-block-${service.number}`}
                className="bg-[#fff9ed] border-4 border-[#1d1b15] brutalist-shadow-lg p-6 sm:p-8 md:p-10 transition-all hover:shadow-[16px_16px_0px_0px_#1d1b15]"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                  
                  {/* Text Details */}
                  <div className={`lg:col-span-7 flex flex-col justify-between ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-headline-lg text-2xl bg-[#1d1b15] text-[#fff9ed] px-3 py-1 border border-[#1d1b15]">
                          {service.number}
                        </span>
                        <span className="font-label-caps text-xs bg-[#8cf5e4] text-[#1d1b15] px-3 py-1 border-2 border-[#1d1b15] font-bold rotate-[-1deg]">
                          {service.tag}
                        </span>
                      </div>

                      <h2 className="font-headline-lg text-3xl sm:text-4xl md:text-5xl text-[#1d1b15] uppercase tracking-tight leading-none mb-4">
                        {service.title}
                      </h2>

                      <p className="font-body-lg text-base sm:text-lg text-[#1d1b15] leading-relaxed mb-6">
                        {service.description}
                      </p>

                      {/* Deliverables tags */}
                      <div className="border-t-2 border-[#1d1b15] pt-4 mb-6">
                        <span className="font-label-caps text-xs text-[#006a60] uppercase block mb-3 font-bold">
                          DELIVERABLE CAPABILITIES:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {service.deliverables.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs sm:text-sm font-body-md text-[#1d1b15]">
                              <CheckSquare className="w-4 h-4 text-[#b7102a] flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-2">
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          onOpenStartProject();
                        }}
                        className="brutalist-btn bg-[#b7102a] text-white px-5 py-2.5 font-label-caps text-xs sm:text-sm uppercase tracking-wider font-bold cursor-pointer"
                      >
                        COMMISSION THIS DISCIPLINE →
                      </button>

                      <button
                        onClick={() => {
                          soundFx.playClick();
                          const matchingArt = ARTWORKS[index] || ARTWORKS[0];
                          onSelectArtwork(matchingArt);
                        }}
                        className="brutalist-btn bg-[#fff9ed] text-[#1d1b15] px-5 py-2.5 font-label-caps text-xs sm:text-sm uppercase tracking-wider font-bold hover:bg-[#8cf5e4] cursor-pointer"
                      >
                        VIEW CASE STUDIES
                      </button>
                    </div>
                  </div>

                  {/* Artwork Image Frame */}
                  <div className={`lg:col-span-5 flex flex-col items-center ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="relative w-full aspect-[4/3] sm:aspect-square border-4 border-[#1d1b15] brutalist-shadow bg-[#1d1b15] overflow-hidden group">
                      <img
                        src={service.image}
                        alt={service.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-[#b7102a]/10 pointer-events-none group-hover:opacity-0 transition-opacity" />
                      <span className="absolute bottom-2 left-2 bg-[#fff9ed] text-[#1d1b15] font-label-caps text-[10px] px-2 py-0.5 border border-[#1d1b15]">
                        REF: SM-{service.number}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* Interactive Alchemy Laboratory / Scope Calculator */}
      <section className="p-6 sm:p-10 md:p-14 bg-[#fff9ed] border-b-4 border-[#1d1b15]">
        <div className="max-w-4xl mx-auto bg-[#ede7dd] border-4 border-[#1d1b15] brutalist-shadow-lg p-6 sm:p-10">
          
          <div className="flex items-center gap-3 mb-4">
            <Wand2 className="w-6 h-6 text-[#b7102a]" />
            <span className="font-label-caps text-xs sm:text-sm text-[#006a60] uppercase font-bold tracking-wider">
              INTERACTIVE SCOPE GENERATOR
            </span>
          </div>

          <h3 className="font-headline-lg text-3xl sm:text-4xl text-[#1d1b15] uppercase tracking-tight mb-2">
            SYNTHESIZE YOUR CREATIVE RECIPE
          </h3>
          <p className="font-body-md text-sm sm:text-base text-[#5b403f] mb-8">
            Calibrate the aesthetic intensity and medium requirements for your upcoming brand or editorial launch.
          </p>

          {/* Controls */}
          <div className="space-y-6">
            
            {/* Chaos Slider */}
            <div className="bg-[#fff9ed] p-4 border-2 border-[#1d1b15] shadow-[2px_2px_0px_0px_#1d1b15]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-label-caps text-xs text-[#1d1b15] uppercase font-bold">
                  SURREAL DISRUPTION INDEX
                </label>
                <span className="font-mono text-sm bg-[#b7102a] text-white px-2 py-0.5 font-bold">
                  {chaosLevel}% DISRUPTIVE
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={chaosLevel}
                onChange={(e) => setChaosLevel(Number(e.target.value))}
                className="w-full h-3 bg-[#ede7dd] border-2 border-[#1d1b15] accent-[#b7102a] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#5b403f] mt-1">
                <span>Controlled Grid</span>
                <span>Tactile Hybrid</span>
                <span>Complete Visual Mutiny</span>
              </div>
            </div>

            {/* Medium Choice */}
            <div>
              <label className="font-label-caps text-xs text-[#1d1b15] uppercase font-bold block mb-2">
                PRIMARY TACTILE MEDIUM:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {mediums.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedMedium(m);
                    }}
                    className={`font-label-caps text-xs p-2.5 border-2 border-[#1d1b15] text-left transition-all cursor-pointer ${
                      selectedMedium === m
                        ? 'bg-[#006a60] text-white font-bold shadow-[2px_2px_0px_0px_#1d1b15]'
                        : 'bg-[#fff9ed] text-[#1d1b15] hover:bg-[#8cf5e4]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Structural Form */}
            <div>
              <label className="font-label-caps text-xs text-[#1d1b15] uppercase font-bold block mb-2">
                ARCHITECTURAL STRUCTURE:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {structures.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedStructure(s);
                    }}
                    className={`font-label-caps text-xs p-2.5 border-2 border-[#1d1b15] text-left transition-all cursor-pointer ${
                      selectedStructure === s
                        ? 'bg-[#a96428] text-white font-bold shadow-[2px_2px_0px_0px_#1d1b15]'
                        : 'bg-[#fff9ed] text-[#1d1b15] hover:bg-[#8cf5e4]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipe Output Box */}
            <div className="bg-[#1d1b15] text-[#fff9ed] p-5 border-2 border-[#1d1b15] mt-6">
              <span className="font-label-caps text-[10px] text-[#8cf5e4] uppercase block mb-1">
                SYNTHESIS RESULT:
              </span>
              <h4 className="font-headline-lg text-xl sm:text-2xl uppercase tracking-tight text-[#fff9ed]">
                {chaosLevel > 70 ? 'TACTICAL SHOCK' : 'TACTILE REVOLUTION'} // {selectedMedium} + {selectedStructure}
              </h4>
              <p className="font-body-md text-xs text-[#ede7dd] mt-2">
                Recommended Squad: Ego Centris (Art Direction) + Narima (Spatial Identity) + Migrasee (Motion Splicing). Estimated delivery cycle: 3-4 weeks.
              </p>

              <button
                onClick={() => {
                  handleMixAlchemy();
                  onOpenStartProject();
                }}
                className="mt-4 w-full bg-[#b7102a] hover:bg-[#8cf5e4] hover:text-[#1d1b15] text-white p-3 font-headline-lg text-lg uppercase tracking-wider border border-white transition-colors cursor-pointer"
              >
                LOCK IN THIS FORMULA & INITIATE BRIEF →
              </button>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
