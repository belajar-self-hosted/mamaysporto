import React from 'react';
import { PageView } from '../types';
import { LayoutGrid, FileText, FlaskConical, Building2 } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SideNavBarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({ currentPage, onNavigate }) => {
  const items = [
    {
      id: 'INDEX' as PageView,
      target: 'HOME' as PageView,
      label: 'INDEX',
      icon: LayoutGrid,
      desc: 'All Works & Gallery',
    },
    {
      id: 'MANIFESTO' as PageView,
      target: 'ABOUT' as PageView,
      label: 'MANIFESTO',
      icon: FileText,
      desc: 'Our Core Philosophy',
    },
    {
      id: 'LABS' as PageView,
      target: 'LABS' as PageView,
      label: 'LABS',
      icon: FlaskConical,
      desc: 'Surreal Visual Reactor',
    },
    {
      id: 'STUDIO' as PageView,
      target: 'SERVICES' as PageView,
      label: 'STUDIO',
      icon: Building2,
      desc: 'Alchemy & Services',
    },
  ];

  return (
    <aside
      id="side-nav-bar"
      className="hidden md:flex flex-col items-center py-6 bg-[#e8e2d7] text-[#006a60] fixed left-0 top-[88px] h-[calc(100vh-88px)] w-16 hover:w-60 transition-all duration-300 overflow-hidden z-40 border-r-4 border-[#1d1b15] group shadow-[4px_0px_0px_0px_rgba(29,27,21,0.5)]"
    >
      <div className="flex flex-col gap-5 w-full px-2">
        {items.map((item) => {
          const isActive = currentPage === item.target || currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`side-nav-${item.id.toLowerCase()}`}
              onClick={() => {
                soundFx.playClick();
                onNavigate(item.target);
              }}
              className={`flex items-center w-full px-3 py-3 gap-3 border-2 border-[#1d1b15] transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#b7102a] text-white font-bold rotate-[-2deg] shadow-[4px_4px_0px_0px_#1d1b15]'
                  : 'bg-[#fff9ed] text-[#1d1b15] hover:bg-[#a96428] hover:text-white hover:rotate-0 rotate-[-1deg] shadow-[2px_2px_0px_0px_#1d1b15]'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex flex-col text-left overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="font-label-caps text-xs tracking-widest leading-none">
                  {item.label}
                </span>
                <span className="text-[10px] font-sans opacity-70 mt-1">
                  {item.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pb-4 w-full px-3 opacity-0 group-hover:opacity-100 transition-opacity text-center">
        <div className="border-2 border-[#1d1b15] bg-[#fff9ed] p-2 rotate-1 shadow-[2px_2px_0px_0px_#1d1b15]">
          <span className="font-label-caps text-[9px] text-[#b7102a] block font-bold">
            SUMUR CREATIVE
          </span>
          <span className="text-[8px] text-[#1d1b15] block font-mono">
            EST. 2024 • WFO
          </span>
        </div>
      </div>
    </aside>
  );
};
