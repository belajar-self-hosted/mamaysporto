import React from 'react';
import { TeamMember } from '../types';
import { soundFx } from '../utils/audio';
import { X, Check, Wrench, Sparkles, Quote } from 'lucide-react';

interface TeamModalProps {
  member: TeamMember | null;
  onClose: () => void;
  onOpenStartProject: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({
  member,
  onClose,
  onOpenStartProject,
}) => {
  if (!member) return null;

  return (
    <div
      id="team-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1d1b15]/80 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="team-modal-content"
        className="relative w-full max-w-3xl bg-[#fff9ed] border-4 border-[#1d1b15] brutalist-shadow-xl p-6 sm:p-8 md:p-10 my-auto text-[#1d1b15]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 bg-[#b7102a] text-white border-2 border-[#1d1b15] hover:bg-[#1d1b15] transition-colors brutalist-shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Member Avatar */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-square border-4 border-[#1d1b15] brutalist-shadow bg-[#1d1b15] overflow-hidden">
              <img
                src={member.image}
                alt={member.alt}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-[#b7102a] text-white font-label-caps text-xs px-2.5 py-1 border border-white font-bold">
                {member.badge}
              </span>
            </div>
          </div>

          {/* Member Info */}
          <div className="md:col-span-7 flex flex-col space-y-4">
            <div>
              <span className="font-label-caps text-xs text-[#006a60] uppercase font-bold tracking-widest block">
                {member.role}
              </span>
              <h2 className="font-headline-lg text-4xl text-[#1d1b15] uppercase tracking-tight leading-none mt-1">
                {member.name}
              </h2>
            </div>

            {/* Quote */}
            <div className="bg-[#ede7dd] border-l-4 border-[#b7102a] p-3 text-xs sm:text-sm font-body-md italic text-[#1d1b15]">
              {member.quote}
            </div>

            {/* Bio */}
            <p className="font-body-lg text-xs sm:text-sm text-[#1d1b15] leading-relaxed">
              {member.bio}
            </p>

            {/* Specialties & Tools */}
            <div className="space-y-2 pt-2 border-t-2 border-[#1d1b15]">
              <div>
                <span className="font-label-caps text-[10px] text-[#5b403f] uppercase font-bold block mb-1">
                  DISCIPLINARY CORE:
                </span>
                <div className="flex flex-wrap gap-1">
                  {member.specialties.map((s, i) => (
                    <span key={i} className="text-[10px] font-label-caps bg-[#8cf5e4] text-[#1d1b15] px-2 py-0.5 border border-[#1d1b15]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <span className="font-label-caps text-[10px] text-[#5b403f] uppercase font-bold block mb-1">
                  TACTICAL WEAPONRY / TOOLS:
                </span>
                <div className="flex flex-wrap gap-1">
                  {member.tools.map((t, i) => (
                    <span key={i} className="text-[10px] font-mono bg-[#fff9ed] text-[#1d1b15] px-2 py-0.5 border border-[#1d1b15]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Project request */}
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
                onOpenStartProject();
              }}
              className="mt-2 brutalist-btn bg-[#1d1b15] text-[#fff9ed] hover:bg-[#b7102a] p-3 font-headline-lg text-base uppercase tracking-wider text-center cursor-pointer"
            >
              REQUEST SQUAD LED BY {member.name} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
