import { Geist, Geist_Mono, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://tama-ai.vercel.app"),
  title: "Tama AI - Asisten Pribadi Fannandya Sutan Sakti Pratama",
  description: "Portofolio Interaktif AI Asisten Pribadi Tama. Tanya tentang profil, pendidikan, dan keahlian Fannandya Sutan Sakti Pratama (Full Stack Developer).",
  openGraph: {
    title: "Tama AI - Asisten Pribadi",
    description: "Portofolio Interaktif AI Asisten Pribadi Tama. Tanya tentang profil, pendidikan, dan keahlian Fannandya Sutan Sakti Pratama.",
    url: "https://tama-ai.vercel.app",
    siteName: "Tama AI Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tama AI Portfolio Preview",
      }
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tama AI - Asisten Pribadi",
    description: "Portofolio Interaktif AI Asisten Pribadi Tama. Tanya tentang profil, pendidikan, dan keahlian Fannandya Sutan Sakti Pratama.",
    images: ["/og-image.jpg"],
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
