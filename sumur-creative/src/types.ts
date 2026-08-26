export type PageView = 'HOME' | 'ABOUT' | 'SERVICES' | 'CONTACT' | 'MANIFESTO' | 'LABS' | 'STUDIO';

export interface Artwork {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  image: string;
  alt: string;
  accentColor: string;
  description: string;
  tags: string[];
  deliverables?: string[];
  dimensions?: string;
  medium?: string;
  client?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  badge: string;
  image: string;
  alt: string;
  colorClass: string;
  bgContainerClass: string;
  colSpan: string;
  rowSpan: string;
  quote: string;
  bio: string;
  specialties: string[];
  tools: string[];
}

export interface ServiceItem {
  number: string;
  tag: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  imageAlt: string;
  bgContainer: string;
  accentColor: string;
  deliverables: string[];
  manifestoExcerpt: string;
}

export interface ProjectBrief {
  name: string;
  email: string;
  archetype: string;
  budget: string;
  timeline: string;
  transmission: string;
}

export interface SignalTransmission {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  status: 'DISPATCHED' | 'RECEIVED' | 'DECODING';
  frequency: string;
}
