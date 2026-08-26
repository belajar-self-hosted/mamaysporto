import React, { useState } from 'react';
import { Artwork, PageView } from '../types';
import { ARTWORKS } from '../data/studioData';
import { soundFx } from '../utils/audio';
import { ArrowUpRight, Sparkles, Filter, Eye, Layers } from 'lucide-react';

interface HomeViewProps {
  onSelectArtwork: (artwork: Artwork) => void;
  onNavigate: (page: PageView) => void;
  onOpenStartProject: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectArtwork,
  onNavigate,
  onOpenStartProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'PRINT', 'CHARACTER', 'SHORT FILM', 'RECRUITMENT', 'MOTION'];

  const filteredArtworks = selectedCategory === 'ALL'
    ? ARTWORKS
    : ARTWORKS.filter(art => 
        art.tags.some(tag => tag.toUpperCase() === selectedCategory) ||
        art.category.toUpperCase().includes(selectedCategory)
      );

  return (
    <div id="home-view" className="w-full flex flex-col">
      {/* Hero Section */}
      <section
        id="hero-section"
        className="relative w-full min-h-[82vh] flex flex-col justify-center items-center p-6 sm:p-10 md:p-14 border-b-4 border-[#1d1b15] overflow-hidden bg-[#f3ede2]"
      >
        {/* Surreal Hero Collage Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBskh_2IyNveQlI-xq4hiLlXrv0UQcSkjt7qXz10w4mYcWWVXw2XYcNo0xnvL3vyLQRTA1mprNAk4vk8c_oVsCK_BnmvL_1f8UCM0HivsAOhqOR06fsXar-GTjYlEQi9oZlLkEEa60W3lLX7KZJYH8nE4fq88XMRvv-5PlII42kPuYQs4ECsy4rrVXIN6f657NYZETlOIpiDaP1-iwl2UjaxzwNORiTmwSjQQwk747jSChmg2jTAH5Y0JfoPdH2MBj5Bg"
            alt="Surreal collage illustration featuring giant red rabbit reading book on vintage cityscape with green dinosaur playing guitar."
            className="w-full h-full object-cover opacity-85 mix-blend-multiply scale-105 transition-transform duration-1000 hover:scale-100"
          />
        </div>

        {/* Ambient Gradient Mesh for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d1b15]/40 via-transparent to-[#fff9ed]/20 pointer-events-none" />

        {/* Centered Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center gap-4">
          
          {/* Badge */}
          <div className="bg-[#fff9ed] border-4 border-[#1d1b15] px-5 py-2 brutalist-shadow rotate-[2deg] inline-block mb-3 hover:rotate-0 transition-transform">
            <span className="font-label-caps text-xs sm:text-sm text-[#b7102a] tracking-widest uppercase font-bold">
              AVANT-GARDE STUDIO
            </span>
          </div>

          {/* Massive Display Title */}
          <h1 className="font-display-xl text-6xl sm:text-7xl md:text-8xl lg:text-[110px] text-[#1d1b15] uppercase tracking-tighter leading-[0.9] drop-shadow-[4px_4px_0px_#fff9ed]">
            BEYOND <br /> THE GRID
          </h1>

          <p className="font-body-lg text-base sm:text-lg md:text-xl text-[#1d1b15] max-w-2xl bg-[#fff9ed]/95 p-3 sm:p-4 border-2 border-[#1d1b15] brutalist-shadow-sm mt-3 rotate-[-1deg]">
            We break standard templates, cultivate artistic friction, and assemble visceral brand narratives that refuse to be ignored.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <button
              id="hero-explore-btn"
              onClick={() => {
                soundFx.playClick();
                document.getElementById('latest-works-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="brutalist-btn-lg bg-[#1d1b15] text-[#fff9ed] px-7 py-3 font-headline-lg text-lg sm:text-xl uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <span>EXPLORE WORKS</span>
              <ArrowUpRight className="w-5 h-5" />
            </button>

            <button
              id="hero-start-project-btn"
              onClick={() => {
                soundFx.playClick();
                onOpenStartProject();
              }}
              className="brutalist-btn-lg bg-[#b7102a] text-white px-7 py-3 font-headline-lg text-lg sm:text-xl uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <span>INITIATE BRIEF</span>
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Latest Works (Exact reproduction of 3 featured cards from Image 7) */}
      <section
        id="latest-works-section"
        className="p-6 sm:p-10 md:p-14 bg-[#fff9ed] border-b-4 border-[#1d1b15]"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-14 border-b-4 border-[#1d1b15] pb-4 gap-4">
          <div>
            <span className="font-label-caps text-xs text-[#006a60] tracking-widest uppercase block mb-1">
              CURATED EXPERIMENTS
            </span>
            <h2 className="font-headline-lg text-4xl sm:text-5xl md:text-6xl text-[#1d1b15] uppercase tracking-tight">
              LATEST WORKS
            </h2>
          </div>
          <span className="font-label-caps text-xs sm:text-sm bg-[#b7102a] text-white px-4 py-1.5 border-2 border-[#1d1b15] brutalist-shadow rotate-[-3deg] uppercase font-bold">
            MIND EXPANDING
          </span>
        </div>

        {/* 3 Bento Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 pb-6">
          
          {/* Card 1: Monster Ego */}
          <article
            id="card-monster-ego"
            onClick={() => {
              soundFx.playClick();
              onSelectArtwork(ARTWORKS[0]);
            }}
            className="group relative aspect-[4/5] brutalist-border bg-[#8cf5e4] brutalist-shadow overflow-hidden translate-y-2 hover:translate-y-0 transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 p-4 sm:p-6 z-20 flex flex-col justify-between pointer-events-none">
              <span className="bg-[#fff9ed] text-[#1d1b15] font-label-caps text-xs px-3 py-1 border-2 border-[#1d1b15] self-start shadow-[2px_2px_0px_0px_#1d1b15]">
                01
              </span>
              <div>
                <span className="bg-[#1d1b15] text-[#8cf5e4] font-label-caps text-[10px] px-2 py-0.5 inline-block mb-1">
                  CHARACTER RIG
                </span>
                <h3 className="font-headline-lg text-3xl sm:text-4xl text-[#fff9ed] mix-blend-difference drop-shadow-[2px_2px_0px_#1d1b15] uppercase leading-none">
                  MONSTER<br />EGO
                </h3>
              </div>
            </div>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
              style={{ backgroundImage: `url('${ARTWORKS[0].image}')` }}
            />
            <div className="absolute bottom-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-[#1d1b15] text-white p-2 border-2 border-[#fff9ed] flex items-center gap-1 font-label-caps text-[10px]">
                <Eye className="w-3.5 h-3.5" /> INSPECT
              </span>
            </div>
          </article>

          {/* Card 2: Narima */}
          <article
            id="card-narima"
            onClick={() => {
              soundFx.playClick();
              onSelectArtwork(ARTWORKS[1]);
            }}
            className="group relative aspect-[4/5] brutalist-border bg-[#a96428] brutalist-shadow overflow-hidden md:-translate-y-6 hover:-translate-y-9 transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 p-4 sm:p-6 z-20 flex flex-col justify-between pointer-events-none">
              <span className="bg-[#fff9ed] text-[#1d1b15] font-label-caps text-xs px-3 py-1 border-2 border-[#1d1b15] self-end shadow-[2px_2px_0px_0px_#1d1b15]">
                02
              </span>
              <div>
                <span className="bg-[#fff9ed] text-[#1d1b15] font-label-caps text-[10px] px-2 py-0.5 inline-block mb-1 border border-[#1d1b15]">
                  SHORT FILM
                </span>
                <h3 className="font-headline-lg text-3xl sm:text-4xl text-[#fff9ed] mix-blend-difference drop-shadow-[2px_2px_0px_#1d1b15] uppercase leading-none">
                  NARIMA
                </h3>
              </div>
            </div>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-2"
              style={{ backgroundImage: `url('${ARTWORKS[1].image}')` }}
            />
            <div className="absolute bottom-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-[#1d1b15] text-white p-2 border-2 border-[#fff9ed] flex items-center gap-1 font-label-caps text-[10px]">
                <Eye className="w-3.5 h-3.5" /> INSPECT
              </span>
            </div>
          </article>

          {/* Card 3: Lowongan Pekerjaan */}
          <article
            id="card-lowongan"
            onClick={() => {
              soundFx.playClick();
              onSelectArtwork(ARTWORKS[2]);
            }}
            className="group relative aspect-[4/5] brutalist-border bg-[#db313f] brutalist-shadow overflow-hidden md:translate-y-6 hover:translate-y-3 transition-all duration-300 cursor-pointer md:col-span-2 lg:col-span-1"
          >
            <div className="absolute inset-0 p-4 sm:p-6 z-20 flex flex-col justify-between pointer-events-none">
              <span className="bg-[#fff9ed] text-[#1d1b15] font-label-caps text-xs px-3 py-1 border-2 border-[#1d1b15] self-start shadow-[2px_2px_0px_0px_#1d1b15]">
                03
              </span>
              <div>
                <span className="bg-[#1d1b15] text-white font-label-caps text-[10px] px-2 py-0.5 inline-block mb-1">
                  RECRUITMENT
                </span>
                <h3 className="font-headline-lg text-3xl sm:text-4xl text-[#fff9ed] mix-blend-difference drop-shadow-[2px_2px_0px_#1d1b15] uppercase leading-none">
                  LOWONGAN<br />PEKERJAAN
                </h3>
              </div>
            </div>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
              style={{ backgroundImage: `url('${ARTWORKS[2].image}')` }}
            />
            <div className="absolute bottom-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-[#1d1b15] text-white p-2 border-2 border-[#fff9ed] flex items-center gap-1 font-label-caps text-[10px]">
                <Eye className="w-3.5 h-3.5" /> INSPECT
              </span>
            </div>
          </article>
        </div>
      </section>

      {/* Complete Studio Archive Grid (Image 9 Showcase) */}
      <section id="full-archive-section" className="p-6 sm:p-10 md:p-14 bg-[#ede7dd] border-b-4 border-[#1d1b15]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-[#b7102a]" />
              <span className="font-label-caps text-xs tracking-widest text-[#1d1b15] uppercase font-bold">
                COMPLETE VISUAL REPOSITORY
              </span>
            </div>
            <h2 className="font-headline-lg text-3xl sm:text-4xl md:text-5xl text-[#1d1b15] uppercase tracking-tight">
              ARCHIVE & POSTER SHOWCASE
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory(cat);
                }}
                className={`font-label-caps text-xs px-3 py-1.5 border-2 border-[#1d1b15] transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#b7102a] text-white shadow-[2px_2px_0px_0px_#1d1b15] font-bold'
                    : 'bg-[#fff9ed] text-[#1d1b15] hover:bg-[#8cf5e4]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 8-Artwork Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredArtworks.map((art) => (
            <div
              key={art.id}
              onClick={() => {
                soundFx.playClick();
                onSelectArtwork(art);
              }}
              className="group bg-[#fff9ed] border-4 border-[#1d1b15] brutalist-shadow hover:shadow-[12px_12px_0px_0px_#1d1b15] hover:-translate-y-2 transition-all duration-200 cursor-pointer flex flex-col"
            >
              {/* Poster Image Frame */}
              <div className="relative aspect-[3/4] w-full overflow-hidden border-b-4 border-[#1d1b15] bg-[#1d1b15]">
                <img
                  src={art.image}
                  alt={art.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-[#1d1b15] text-[#fff9ed] font-label-caps text-[10px] px-2 py-0.5 border border-[#fff9ed]">
                  {art.number}
                </span>
                <span className="absolute bottom-2 right-2 bg-[#fff9ed] text-[#b7102a] font-label-caps text-[9px] px-1.5 py-0.5 border border-[#1d1b15] font-bold">
                  {art.year}
                </span>
              </div>

              {/* Poster Title & Details */}
              <div className="p-4 flex flex-col flex-grow justify-between bg-[#fff9ed]">
                <div>
                  <h4 className="font-headline-lg text-lg text-[#1d1b15] uppercase tracking-tight leading-tight group-hover:text-[#b7102a] transition-colors">
                    {art.title}
                  </h4>
                  <p className="font-body-md text-xs text-[#5b403f] mt-1 line-clamp-2">
                    {art.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t-2 border-[#1d1b15]/20 flex justify-between items-center">
                  <span className="font-label-caps text-[10px] text-[#006a60] uppercase">
                    {art.category.split('&')[0]}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#1d1b15] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manifesto Callout Banner */}
      <section className="p-6 sm:p-10 md:p-14 bg-[#1d1b15] text-[#fff9ed] border-b-4 border-[#b7102a]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <span className="bg-[#b7102a] text-white px-3 py-1 font-label-caps text-xs uppercase font-bold inline-block mb-3 rotate-[-2deg]">
              STUDIO PHILOSOPHY
            </span>
            <h3 className="font-display-lg text-4xl sm:text-5xl md:text-6xl uppercase tracking-tighter text-[#fff9ed] leading-none">
              WE ARE THE MONSTERS
            </h3>
            <p className="font-body-lg text-base sm:text-lg text-[#e8e2d7] mt-3">
              Embracing the absurd, the bold, and the unapologetically weird. We are a collective of surrealist thinkers building beyond the grid.
            </p>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('ABOUT');
            }}
            className="border-2 border-[#fff9ed] bg-[#b7102a] hover:bg-[#fff9ed] hover:text-[#1d1b15] text-white px-8 py-4 font-headline-lg text-xl uppercase tracking-wider shadow-[4px_4px_0px_0px_#fff9ed] transition-all cursor-pointer whitespace-nowrap"
          >
            READ MANIFESTO →
          </button>
        </div>
      </section>
    </div>
  );
};
