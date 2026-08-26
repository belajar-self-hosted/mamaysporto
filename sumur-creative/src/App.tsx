import React, { useState, useEffect } from 'react';
import { PageView, Artwork, TeamMember } from './types';
import { TopNavbar } from './components/TopNavbar';
import { SideNavBar } from './components/SideNavBar';
import { HomeView } from './components/HomeView';
import { AboutView } from './components/AboutView';
import { ServicesView } from './components/ServicesView';
import { ContactView } from './components/ContactView';
import { LabsView } from './components/LabsView';
import { ArtworkModal } from './components/ArtworkModal';
import { TeamModal } from './components/TeamModal';
import { StartProjectModal } from './components/StartProjectModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('HOME');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [startProjectOpen, setStartProjectOpen] = useState<boolean>(false);

  // Sync scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-[#fff9ed] text-[#1d1b15] flex flex-col relative selection:bg-[#b7102a] selection:text-white">
      {/* Paper Grain / Noise Texture Overlay */}
      <div className="texture-overlay" />

      {/* Top Navbar */}
      <TopNavbar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onOpenStartProject={() => setStartProjectOpen(true)}
      />

      {/* Main Content Area with Fixed Side Nav on Desktop */}
      <div className="flex-grow flex w-full relative">
        <SideNavBar
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
        />

        <main className="flex-1 md:pl-16 w-full overflow-x-hidden">
          {currentPage === 'HOME' && (
            <HomeView
              onSelectArtwork={(art) => setSelectedArtwork(art)}
              onNavigate={(page) => setCurrentPage(page)}
              onOpenStartProject={() => setStartProjectOpen(true)}
            />
          )}

          {currentPage === 'ABOUT' && (
            <AboutView
              onSelectMember={(mem) => setSelectedMember(mem)}
              onOpenStartProject={() => setStartProjectOpen(true)}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'SERVICES' && (
            <ServicesView
              onOpenStartProject={() => setStartProjectOpen(true)}
              onNavigate={(page) => setCurrentPage(page)}
              onSelectArtwork={(art) => setSelectedArtwork(art)}
            />
          )}

          {currentPage === 'CONTACT' && (
            <ContactView />
          )}

          {currentPage === 'LABS' && (
            <LabsView />
          )}

          {/* Footer Component */}
          <Footer
            onNavigate={(page) => setCurrentPage(page)}
            onOpenStartProject={() => setStartProjectOpen(true)}
          />
        </main>
      </div>

      {/* Modals */}
      <ArtworkModal
        artwork={selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        onOpenStartProject={() => {
          setSelectedArtwork(null);
          setStartProjectOpen(true);
        }}
      />

      <TeamModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onOpenStartProject={() => {
          setSelectedMember(null);
          setStartProjectOpen(true);
        }}
      />

      <StartProjectModal
        isOpen={startProjectOpen}
        onClose={() => setStartProjectOpen(false)}
      />
    </div>
  );
}
