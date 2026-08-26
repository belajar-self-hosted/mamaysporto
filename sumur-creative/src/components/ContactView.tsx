import React, { useState } from 'react';
import { SignalTransmission } from '../types';
import { soundFx } from '../utils/audio';
import { Send, MapPin, Radio, CheckCircle2, Terminal, RefreshCw } from 'lucide-react';

export const ContactView: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    frequency: '98.4 MHz [ENCRYPTED]',
    transmission: '',
  });

  const [transmissions, setTransmissions] = useState<SignalTransmission[]>([
    {
      id: 'SIG-8821',
      name: 'ARCHIVE COLLECTOR #44',
      email: 'collector@berlin.de',
      message: 'Requesting limited risograph exhibition prints for gallery.',
      timestamp: '2 hours ago',
      status: 'DECODING',
      frequency: '104.2 MHz',
    },
    {
      id: 'SIG-8819',
      name: 'TOKO SERUNI',
      email: 'contact@seruni.id',
      message: 'Spatial rebrand concept approved. Ready for deployment.',
      timestamp: '5 hours ago',
      status: 'RECEIVED',
      frequency: '92.1 MHz',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.transmission) return;

    setIsSubmitting(true);
    soundFx.playSignalSend();

    setTimeout(() => {
      const newSignal: SignalTransmission = {
        id: `SIG-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formState.name.toUpperCase(),
        email: formState.email,
        message: formState.transmission,
        timestamp: 'Just now',
        status: 'DISPATCHED',
        frequency: `${(88 + Math.random() * 20).toFixed(1)} MHz`,
      };

      setTransmissions([newSignal, ...transmissions]);
      setIsSubmitting(false);
      setSuccessMessage('SIGNAL DISPATCHED & LOGGED TO FREQUENCY CONSOLE.');
      setFormState({
        name: '',
        email: '',
        frequency: '98.4 MHz [ENCRYPTED]',
        transmission: '',
      });

      setTimeout(() => setSuccessMessage(null), 6000);
    }, 900);
  };

  return (
    <div id="contact-view" className="w-full flex flex-col">
      {/* Header */}
      <section className="p-6 sm:p-10 md:p-14 bg-[#fff9ed] border-b-4 border-[#1d1b15]">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="bg-[#b7102a] text-white px-4 py-1 border-2 border-[#1d1b15] font-label-caps text-xs rotate-[-2deg] brutalist-shadow-sm mb-4 font-bold">
            TRANSMISSION TOWER
          </div>
          <h1 className="font-display-xl text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[#1d1b15] uppercase tracking-tighter leading-none">
            DROP A SIGNAL
          </h1>
          <p className="font-body-lg text-lg sm:text-xl text-[#1d1b15] max-w-2xl mt-4 bg-[#ede7dd] p-4 border-2 border-[#1d1b15] brutalist-shadow-sm rotate-1">
            Have a commission, spatial project, or brand crisis that demands surrealist mutiny? Transmit your signal below.
          </p>
        </div>
      </section>

      {/* Main Grid: Form on Left, The Nest on Right */}
      <section className="p-6 sm:p-10 md:p-14 bg-[#ede7dd] border-b-4 border-[#1d1b15]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
          
          {/* Left Column: Brutalist Signal Form (Exact to Image 5) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-[#fff9ed] border-4 border-[#1d1b15] brutalist-shadow-lg p-6 sm:p-8 md:p-10">
              
              <div className="flex justify-between items-center border-b-4 border-[#1d1b15] pb-4 mb-6">
                <div>
                  <span className="font-label-caps text-xs text-[#006a60] uppercase block font-bold">
                    COMMUNICATION PROTOCOL
                  </span>
                  <h2 className="font-headline-lg text-3xl text-[#1d1b15] uppercase tracking-tight">
                    TRANSMISSION FORM
                  </h2>
                </div>
                <Radio className="w-6 h-6 text-[#b7102a] animate-pulse" />
              </div>

              {successMessage && (
                <div className="mb-6 bg-[#8cf5e4] border-2 border-[#1d1b15] p-4 brutalist-shadow flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#006a60] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-label-caps text-xs text-[#006a60] uppercase font-bold block">
                      TRANSMISSION SUCCESS
                    </span>
                    <p className="font-body-md text-xs sm:text-sm text-[#1d1b15]">
                      {successMessage}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Field 1: Name / Entity */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="font-label-caps text-xs sm:text-sm text-[#1d1b15] uppercase font-bold block mb-2"
                  >
                    NAME / ENTITY
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Who are you?"
                    className="neo-brutalist-input w-full p-3.5 font-body-md text-sm sm:text-base text-[#1d1b15]"
                  />
                </div>

                {/* Field 2: Communication Frequency (Email) */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="font-label-caps text-xs sm:text-sm text-[#1d1b15] uppercase font-bold block mb-2"
                  >
                    COMMUNICATION FREQUENCY
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="email@void.net"
                    className="neo-brutalist-input w-full p-3.5 font-body-md text-sm sm:text-base text-[#1d1b15]"
                  />
                </div>

                {/* Field 3: Transmission Message */}
                <div>
                  <label
                    htmlFor="contact-transmission"
                    className="font-label-caps text-xs sm:text-sm text-[#1d1b15] uppercase font-bold block mb-2"
                  >
                    TRANSMISSION
                  </label>
                  <textarea
                    id="contact-transmission"
                    rows={5}
                    required
                    value={formState.transmission}
                    onChange={(e) => setFormState({ ...formState, transmission: e.target.value })}
                    placeholder="What is your signal?"
                    className="neo-brutalist-input w-full p-3.5 font-body-md text-sm sm:text-base text-[#1d1b15]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="brutalist-btn-lg w-full bg-[#1d1b15] text-[#fff9ed] hover:bg-[#b7102a] p-4 font-headline-lg text-xl sm:text-2xl uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>DISPATCHING FREQUENCY...</span>
                    </>
                  ) : (
                    <>
                      <span>SUBMIT</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>

          {/* Right Column: "THE NEST" Map Section (Exact to Image 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* The Nest Card with vintage map illustration */}
            <div className="bg-[#fff9ed] border-4 border-[#1d1b15] brutalist-shadow-lg p-6 flex flex-col">
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#b7102a]" />
                  <h3 className="font-headline-lg text-2xl text-[#1d1b15] uppercase">
                    THE NEST
                  </h3>
                </div>
                <span className="bg-[#ede7dd] text-[#1d1b15] font-label-caps text-[10px] px-2 py-1 border border-[#1d1b15]">
                  PHYSICAL MATRIX
                </span>
              </div>

              {/* Map Illustration with "LOCATE US" sticker */}
              <div className="relative w-full aspect-[4/3] border-4 border-[#1d1b15] bg-[#1d1b15] overflow-hidden group">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6H-Vc_zxZdTX7tCEpWQmH2i3t7ODafTNEjci9_B7XXjepxD1McljEbAC3ZP70UJorQC3Qy7mGRxk-Ml_7fAE85u6DNCMHPGUNJdmbRJAmTTPphlxJbzZ8fAt33R0fetwsvMh702uLWZWBmHBmSP4GbYdoFGLwyZLTDPCHPoj_Gi9khDv9dtUXXS_bXBkOQjSfX0dr1Os-KyIjcMVHIY9edNS4pJcxK6VkbjB4NK9YKz__kbfdFG-T"
                  alt="Surreal hand-drawn treasure map parchment with jagged coastlines, compass rose and mysterious markers."
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* "LOCATE US" Angle Badge */}
                <div className="absolute top-4 left-4 bg-[#fff9ed] text-[#1d1b15] border-2 border-[#1d1b15] px-3 py-1 font-label-caps text-xs uppercase font-bold brutalist-shadow rotate-[-4deg]">
                  LOCATE US
                </div>

                {/* "COORDINATES UNKNOWN" Stamp */}
                <div className="absolute bottom-4 right-4 bg-[#b7102a] text-white border-2 border-white px-3 py-1 font-label-caps text-[10px] uppercase font-bold rotate-[6deg]">
                  COORDINATES UNKNOWN
                </div>
              </div>

              {/* Studio Coordinates Info */}
              <div className="mt-5 space-y-2 border-t-2 border-[#1d1b15] pt-4 font-body-md text-xs sm:text-sm text-[#1d1b15]">
                <div className="flex justify-between">
                  <span className="font-label-caps text-[#5b403f]">HEADQUARTERS:</span>
                  <span className="font-bold">YOGYAKARTA • WFO</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-label-caps text-[#5b403f]">OPERATION HOURS:</span>
                  <span className="font-bold">11:00 — 02:00 WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-label-caps text-[#5b403f]">DIRECT SIGNAL:</span>
                  <span className="font-mono text-[#b7102a]">signal@sumurcreative.com</span>
                </div>
              </div>
            </div>

            {/* Live Frequency Dispatch Log */}
            <div className="bg-[#1d1b15] text-[#fff9ed] border-4 border-[#1d1b15] p-5 brutalist-shadow">
              <div className="flex items-center gap-2 mb-3 border-b border-[#fff9ed]/30 pb-2">
                <Terminal className="w-4 h-4 text-[#8cf5e4]" />
                <span className="font-label-caps text-xs text-[#8cf5e4] uppercase font-bold">
                  SIGNAL DISPATCH CONSOLE
                </span>
              </div>
              <div className="space-y-3">
                {transmissions.slice(0, 3).map((item) => (
                  <div key={item.id} className="text-xs font-mono border-b border-[#fff9ed]/10 pb-2">
                    <div className="flex justify-between text-[#8cf5e4]">
                      <span>{item.id} [{item.frequency}]</span>
                      <span className="text-[10px] opacity-70">{item.timestamp}</span>
                    </div>
                    <p className="text-white font-sans mt-0.5 truncate">{item.name}: "{item.message}"</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
