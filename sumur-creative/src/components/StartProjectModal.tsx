import React, { useState } from 'react';
import { ProjectBrief } from '../types';
import { soundFx } from '../utils/audio';
import { X, Sparkles, Check, Send, AlertTriangle } from 'lucide-react';

interface StartProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StartProjectModal: React.FC<StartProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<ProjectBrief>({
    name: '',
    email: '',
    archetype: '01 — GRAPHIC DESIGN / VISUAL MUTINY',
    budget: '$5,000 — $15,000',
    timeline: '3 - 6 Weeks',
    transmission: '',
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const archetypes = [
    '01 — GRAPHIC DESIGN / VISUAL MUTINY',
    '02 — VIDEO EDITING / TEMPORAL SPLICING',
    '03 — CONTENT PLANNING / STRATEGIC CHAOS',
    '04 — FULL SUITE BRAND RESURRECTION',
    '05 — BESPOKE RISOGRAPH & PRINT LAB',
  ];

  const budgetTiers = [
    '< $3,000 (Experimental Micro-Drop)',
    '$3,000 — $8,000 (Standard Brand Sprint)',
    '$8,000 — $20,000 (Full Visual Mutiny & Motion)',
    '> $20,000 (Omnipresent Cultural Infiltration)',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSignalSend();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      id="start-project-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1d1b15]/85 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="start-project-modal-content"
        className="relative w-full max-w-2xl bg-[#fff9ed] border-4 border-[#1d1b15] brutalist-shadow-xl p-6 sm:p-8 md:p-10 my-auto text-[#1d1b15]"
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

        {submitted ? (
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 mx-auto bg-[#8cf5e4] border-4 border-[#1d1b15] flex items-center justify-center brutalist-shadow">
              <Check className="w-10 h-10 text-[#006a60]" />
            </div>

            <h2 className="font-display-lg text-4xl sm:text-5xl text-[#1d1b15] uppercase tracking-tight">
              TRANSMISSION RECEIVED
            </h2>

            <div className="bg-[#ede7dd] border-2 border-[#1d1b15] p-5 text-left text-xs sm:text-sm font-mono space-y-2 brutalist-shadow-sm">
              <div className="text-[#b7102a] font-bold">DISPATCH REF: #SUMUR-REQ-{Math.floor(10000 + Math.random() * 90000)}</div>
              <div>CLIENT: {formData.name} ({formData.email})</div>
              <div>DISCIPLINE: {formData.archetype}</div>
              <div>TIER: {formData.budget}</div>
              <div className="pt-2 text-[#5b403f] font-sans">
                "Our collective will decode your brief within 24 operational hours. Prepare for non-standard thinking."
              </div>
            </div>

            <button
              onClick={handleReset}
              className="brutalist-btn-lg bg-[#b7102a] text-white px-8 py-3 font-headline-lg text-xl uppercase cursor-pointer"
            >
              CLOSE TRANSMISSION CONSOLE
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#b7102a]" />
              <span className="font-label-caps text-xs text-[#006a60] uppercase font-bold tracking-widest">
                PROJECT INITIATION PROTOCOL
              </span>
            </div>

            <h2 className="font-display-xl text-3xl sm:text-4xl md:text-5xl text-[#1d1b15] uppercase tracking-tight leading-none mb-1">
              INITIATE SEQUENCE
            </h2>
            <p className="font-body-md text-xs sm:text-sm text-[#5b403f] mb-6">
              Give us the raw parameters of your challenge. No sanitized templates allowed.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-xs text-[#1d1b15] uppercase font-bold block mb-1">
                    ENTITY / CLIENT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Studio Redux"
                    className="neo-brutalist-input w-full p-2.5 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs text-[#1d1b15] uppercase font-bold block mb-1">
                    COMMUNICATION FREQUENCY (EMAIL) *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@dimension.io"
                    className="neo-brutalist-input w-full p-2.5 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-xs text-[#1d1b15] uppercase font-bold block mb-1">
                  PROJECT ARCHETYPE:
                </label>
                <select
                  value={formData.archetype}
                  onChange={(e) => setFormData({ ...formData, archetype: e.target.value })}
                  className="neo-brutalist-input w-full p-2.5 text-xs font-label-caps uppercase"
                >
                  {archetypes.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-label-caps text-xs text-[#1d1b15] uppercase font-bold block mb-1">
                  BUDGET MATRIX:
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="neo-brutalist-input w-full p-2.5 text-xs font-label-caps uppercase"
                >
                  {budgetTiers.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-label-caps text-xs text-[#1d1b15] uppercase font-bold block mb-1">
                  TRANSMISSION BRIEF / CHALLENGE SUMMARY:
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                  placeholder="Describe what you want to shatter, build, or reinvent..."
                  className="neo-brutalist-input w-full p-2.5 text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="brutalist-btn-lg w-full bg-[#b7102a] text-white p-3.5 font-headline-lg text-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>TRANSMIT BRIEF →</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
