import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WelcomeModal from "./components/WelcomeModal";
import CustomCursor from "./components/CustomCursor";
import Marquee from "./components/Marquee";
import ChatTicker from "./components/ChatTicker";
import Hero from "./sections/Hero";
import ChatAI from "./sections/ChatAI";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Experience from "./sections/Experience";
import Contact from "./sections/Contact";

export default function App() {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <WelcomeModal />
      <main>
        <Hero />
        <ChatAI />
        <ChatTicker />
        <About />
        <Skills />
        <Marquee />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
