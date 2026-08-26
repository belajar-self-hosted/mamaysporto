import React, { useState } from 'react';
import { TeamMember, PageView } from '../types';
import { TEAM_MEMBERS, MANIFESTO_CLAUSES } from '../data/studioData';
import { soundFx } from '../utils/audio';
import { Sparkles, ArrowRight, Eye, ShieldCheck, Flame, Cpu } from 'lucide-react';

interface AboutViewProps {
  onSelectMember: (member: TeamMember) => void;
  onOpenStartProject: () => void;
  onNavigate: (page: PageView) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onSelectMember,
  onOpenStartProject,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'MANIFESTO' | 'COLLECTIVE' | 'ORIGINS'>('MANIFESTO');

  return (
    <div id="about-view" className="w-full flex flex-col">
      {/* Hero Header Section */}
      <section className="relative p-6 sm:p-10 md:p-14 border-b-4 border-[#1d1b15] bg-[#fff9ed] overflow-hidden">
        {/* Background graphic elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#db313f] opacity-20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-[#006a60] opacity-20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Angled Brutalist Headline Banner */}
          <div className="bg-[#1d1b15] text-[#fff9ed] border-4 border-[#1d1b15] px-6 sm:px-10 py-3 sm:py-4 brutalist-shadow rotate-[1deg] hover:rotate-0 transition-transform mb-6">
            <h1 className="font-display-xl text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase leading-none">
              WE ARE THE MONSTERS
            </h1>
          </div>

          <p className="font-body-lg text-lg sm:text-xl md:text-2xl text-[#1d1b15] max-w-3xl leading-relaxed bg-[#ede7dd] border-2 border-[#1d1b15] p-5 sm:p-6 brutalist-shadow-sm rotate-[-1deg]">
            Embracing the absurd, the bold, and the unapologetically weird. We are a collective of surrealist thinkers building beyond the grid.
          </p>

          {/* Quick Sub-navigation */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('MANIFESTO');
                document.getElementById('manifesto-block')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`font-label-caps text-xs sm:text-sm px-4 py-2 border-2 border-[#1d1b15] transition-all cursor-pointer ${
                activeTab === 'MANIFESTO'
                  ? 'bg-[#b7102a] text-white shadow-[4px_4px_0px_0px_#1d1b15] font-bold'
                  : 'bg-[#fff9ed] text-[#1d1b15] hover:bg-[#8cf5e4]'
              }`}
            >
              01. MANIFESTO
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('COLLECTIVE');
                document.getElementById('collective-block')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`font-label-caps text-xs sm:text-sm px-4 py-2 border-2 border-[#1d1b15] transition-all cursor-pointer ${
                activeTab === 'COLLECTIVE'
                  ? 'bg-[#b7102a] text-white shadow-[4px_4px_0px_0px_#1d1b15] font-bold'
                  : 'bg-[#fff9ed] text-[#1d1b15] hover:bg-[#8cf5e4]'
              }`}
            >
              02. THE COLLECTIVE
            </button>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section
        id="manifesto-block"
        className="p-6 sm:p-10 md:p-14 bg-[#ede7dd] border-b-4 border-[#1d1b15]"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Left Text Block */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-xs bg-[#b7102a] text-white px-3 py-1 border-2 border-[#1d1b15] brutalist-shadow-sm rotate-[-2deg]">
                CORE ETHOS
              </span>
              <span className="font-label-caps text-xs tracking-widest text-[#006a60] uppercase">
                OUR MANIFESTO
              </span>
            </div>

            <h2 className="font-headline-lg text-4xl sm:text-5xl md:text-6xl text-[#1d1b15] uppercase tracking-tight leading-none">
              DEFY LOGIC. BREAK TEMPLATES.
            </h2>

            <div className="bg-[#fff9ed] border-4 border-[#1d1b15] p-6 sm:p-8 brutalist-shadow space-y-4">
              <p className="font-body-lg text-base sm:text-lg text-[#1d1b15] leading-relaxed">
                We believe standard frameworks are designed to breed mediocrity. By embracing the surreal, we break free from predictable patterns to discover raw, visceral creative truths.
              </p>
              <p className="font-body-md text-sm sm:text-base text-[#5b403f] border-t-2 border-[#1d1b15]/20 pt-4">
                In a world dominated by sanitized AI templates and cookie-cutter corporate branding, friction is our weapon. We forge graphic rebellions that demand attention and spark genuine emotional resonance.
              </p>
            </div>

            {/* 4 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {MANIFESTO_CLAUSES.map((clause) => (
                <div
                  key={clause.number}
                  className="bg-[#fff9ed] border-2 border-[#1d1b15] p-4 shadow-[3px_3px_0px_0px_#1d1b15] hover:bg-[#8cf5e4] transition-colors"
                >
                  <span className="font-label-caps text-xs text-[#b7102a] block font-bold">
                    {clause.number}. {clause.title}
                  </span>
                  <p className="font-body-md text-xs text-[#1d1b15] mt-1">
                    {clause.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Surreal Collage Graphics */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-square bg-[#1d1b15] border-4 border-[#1d1b15] brutalist-shadow-lg rotate-2 hover:rotate-0 transition-transform duration-300 overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-XDXcMe1YjUFTWYZQJnXD6kWCH5uzuLM30JQXv5Uj8mP0AGOXq0uxWNqL9xcEd3MGTawAZLqtvNALCNa1-_mnIoPIVpDdyo79_zWqMfyJID6WLoDp7hwg8gRWDSK2bJRGlex2ic7-FU-TyaMjeZ3DtRkMdVQwO1zR7MT0d4ccb8BsGpi8HpHTDGWK-5OwY2i1xP-2o7gdpT214DdGvqBSKd6CEksjV6YLvmtHTjG-6gEi4IukkHTn"
                alt="Surreal collage featuring a vintage television with a realistic human eyeball and botanical growth on aged parchment."
                className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500"
              />
              <div className="absolute bottom-3 left-3 bg-[#b7102a] text-white px-3 py-1 font-label-caps text-[10px] border border-white">
                FIG. 01 — THE OMNISCIENT SCREEN
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Collective Bento Grid (Exact reproduction of 4 team members) */}
      <section
        id="collective-block"
        className="p-6 sm:p-10 md:p-14 bg-[#fff9ed] border-b-4 border-[#1d1b15]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 pb-4 border-b-4 border-[#1d1b15] gap-4">
            <div>
              <span className="font-label-caps text-xs text-[#b7102a] tracking-widest uppercase block mb-1">
                04 INDIVIDUALS
              </span>
              <h2 className="font-headline-lg text-4xl sm:text-5xl md:text-6xl text-[#1d1b15] uppercase tracking-tight">
                THE COLLECTIVE
              </h2>
            </div>
            <span className="font-label-caps text-xs bg-[#1d1b15] text-[#fff9ed] px-4 py-2 border-2 border-[#1d1b15]">
              CLICK ANY MEMBER TO INSPECT PROFILE
            </span>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
            
            {/* 1. Ego Centris (md:col-span-5 md:row-span-2) */}
            <article
              id="team-ego-centris"
              onClick={() => {
                soundFx.playClick();
                onSelectMember(TEAM_MEMBERS[0]);
              }}
              className="md:col-span-5 md:row-span-2 bg-[#fff9ed] border-4 border-[#1d1b15] brutalist-shadow p-6 flex flex-col justify-between group hover:shadow-[12px_12px_0px_0px_#1d1b15] hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden relative"
            >
              <div className="z-10 flex justify-between items-start">
                <span className="bg-[#b7102a] text-white font-label-caps text-xs px-3 py-1 border-2 border-[#1d1b15] rotate-[-2deg] font-bold">
                  {TEAM_MEMBERS[0].badge}
                </span>
                <span className="bg-[#1d1b15] text-[#fff9ed] font-mono text-xs px-2 py-0.5">
                  01
                </span>
              </div>

              <div className="my-auto relative w-full aspect-square max-w-[260px] mx-auto overflow-hidden border-2 border-[#1d1b15] bg-[#ede7dd]">
                <img
                  src={TEAM_MEMBERS[0].image}
                  alt={TEAM_MEMBERS[0].alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="z-10 mt-4 border-t-2 border-[#1d1b15] pt-3">
                <span className="font-label-caps text-xs text-[#b7102a] uppercase block">
                  {TEAM_MEMBERS[0].role}
                </span>
                <h3 className="font-headline-lg text-3xl sm:text-4xl text-[#1d1b15] uppercase tracking-tight leading-none">
                  {TEAM_MEMBERS[0].name}
                </h3>
                <p className="font-body-md text-xs text-[#5b403f] mt-2 line-clamp-2">
                  {TEAM_MEMBERS[0].quote}
                </p>
              </div>
            </article>

            {/* 2. Narima (md:col-span-7 md:row-span-1) */}
            <article
              id="team-narima"
              onClick={() => {
                soundFx.playClick();
                onSelectMember(TEAM_MEMBERS[1]);
              }}
              className="md:col-span-7 md:row-span-1 bg-[#006a60] text-white border-4 border-[#1d1b15] brutalist-shadow p-6 flex flex-col sm:flex-row items-center justify-between group hover:shadow-[12px_12px_0px_0px_#1d1b15] hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden gap-6"
            >
              <div className="flex flex-col justify-between h-full flex-1">
                <div>
                  <span className="bg-[#8cf5e4] text-[#1d1b15] font-label-caps text-xs px-3 py-1 border-2 border-[#1d1b15] inline-block font-bold">
                    {TEAM_MEMBERS[1].badge}
                  </span>
                  <span className="font-label-caps text-xs text-[#8cf5e4] block mt-3 uppercase">
                    {TEAM_MEMBERS[1].role}
                  </span>
                  <h3 className="font-headline-lg text-3xl sm:text-4xl text-white uppercase tracking-tight leading-tight">
                    {TEAM_MEMBERS[1].name}
                  </h3>
                </div>
                <p className="font-body-md text-xs text-[#8cf5e4] mt-2">
                  {TEAM_MEMBERS[1].quote}
                </p>
              </div>

              <div className="w-40 h-40 flex-shrink-0 overflow-hidden border-2 border-[#1d1b15] bg-[#fff9ed]">
                <img
                  src={TEAM_MEMBERS[1].image}
                  alt={TEAM_MEMBERS[1].alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </article>

            {/* 3. Karjawan (md:col-span-3 md:row-span-1) */}
            <article
              id="team-karjawan"
              onClick={() => {
                soundFx.playClick();
                onSelectMember(TEAM_MEMBERS[2]);
              }}
              className="md:col-span-3 md:row-span-1 bg-[#a96428] text-white border-4 border-[#1d1b15] brutalist-shadow p-5 flex flex-col justify-between group hover:shadow-[12px_12px_0px_0px_#1d1b15] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="bg-[#fff9ed] text-[#1d1b15] font-label-caps text-[10px] px-2 py-0.5 border border-[#1d1b15] font-bold">
                  03
                </span>
                <span className="font-label-caps text-[10px] text-[#fff9ed]">
                  {TEAM_MEMBERS[2].role}
                </span>
              </div>
              <div className="my-1">
                <h3 className="font-headline-lg text-2xl text-white uppercase leading-none">
                  {TEAM_MEMBERS[2].name}
                </h3>
                <p className="font-body-md text-[11px] text-[#ede7dd] mt-1 line-clamp-2">
                  {TEAM_MEMBERS[2].quote}
                </p>
              </div>
              <span className="text-[10px] font-label-caps text-white underline underline-offset-4">
                INSPECT DOSSIER →
              </span>
            </article>

            {/* 4. Migrasee (md:col-span-4 md:row-span-1) */}
            <article
              id="team-migrasee"
              onClick={() => {
                soundFx.playClick();
                onSelectMember(TEAM_MEMBERS[3]);
              }}
              className="md:col-span-4 md:row-span-1 bg-[#b7102a] text-white border-4 border-[#1d1b15] brutalist-shadow p-5 flex flex-col justify-between group hover:shadow-[12px_12px_0px_0px_#1d1b15] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="bg-[#1d1b15] text-[#fff9ed] font-label-caps text-[10px] px-2 py-0.5 border border-[#fff9ed] font-bold">
                  04
                </span>
                <span className="font-label-caps text-[10px] text-[#8cf5e4]">
                  {TEAM_MEMBERS[3].role}
                </span>
              </div>
              <div className="my-1">
                <h3 className="font-headline-lg text-2xl text-white uppercase leading-none">
                  {TEAM_MEMBERS[3].name}
                </h3>
                <p className="font-body-md text-[11px] text-[#fff9ed] mt-1 line-clamp-2">
                  {TEAM_MEMBERS[3].quote}
                </p>
              </div>
              <span className="text-[10px] font-label-caps text-white underline underline-offset-4">
                INSPECT DOSSIER →
              </span>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="p-8 sm:p-12 md:p-16 bg-[#006a60] text-white border-b-4 border-[#1d1b15] text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          <div className="bg-[#8cf5e4] text-[#1d1b15] font-label-caps text-xs sm:text-sm px-4 py-1 border-2 border-[#1d1b15] brutalist-shadow rotate-[-2deg] font-bold">
            CALL TO ACTION
          </div>
          <h2 className="font-display-xl text-5xl sm:text-6xl md:text-7xl uppercase tracking-tighter leading-none text-white">
            DARE TO CREATE?
          </h2>
          <p className="font-body-lg text-lg sm:text-xl text-[#8cf5e4] max-w-xl">
            Stop blending in. Let's build something that forces them to look.
          </p>
          <button
            id="about-initiate-btn"
            onClick={() => {
              soundFx.playClick();
              onOpenStartProject();
            }}
            className="brutalist-btn-lg bg-[#b7102a] text-white px-8 sm:px-12 py-4 font-headline-lg text-xl sm:text-2xl uppercase tracking-wider mt-4 cursor-pointer"
          >
            INITIATE SEQUENCE →
          </button>
        </div>
      </section>
    </div>
  );
};
