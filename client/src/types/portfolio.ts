export type SectionKey =
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "certifications"
  | "languages"
  | "interests"
  | "testimonials"
  | "contact";

export interface SocialLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  techStack: string[];
  liveUrl: string;
  repoUrl: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  start: string;
  end: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  quote: string;
  avatar: string;
}

export interface Contact {
  email: string;
  phone: string;
  location: string;
  message: string;
  socials: SocialLink[];
}

export interface PortfolioContent {
  hero: { name: string; tagline: string; headshot: string; socials: SocialLink[] };
  about: { bio: string };
  skills: { items: string[] };
  projects: { items: Project[] };
  experience: { items: Experience[] };
  education: { items: Education[] };
  certifications: { items: Certification[] };
  languages: { items: Language[] };
  interests: { items: string[] };
  testimonials: { items: Testimonial[] };
  contact: Contact;
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
}

export const TEMPLATES = ["minimal-dev", "creative-grid", "single-page-scroll", "sidebar-profile"] as const;
export type TemplateId = (typeof TEMPLATES)[number];

export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  slug: string;
  template: TemplateId;
  content: PortfolioContent;
  createdAt: string;
  updatedAt: string;
}

export function normalizeContent(content: Partial<PortfolioContent> | null | undefined): PortfolioContent {
  const defaults = emptyContent();
  if (!content) return defaults;
  return {
    hero: { ...defaults.hero, ...content.hero, socials: content.hero?.socials ?? defaults.hero.socials },
    about: { ...defaults.about, ...content.about },
    skills: { ...defaults.skills, ...content.skills },
    projects: { ...defaults.projects, ...content.projects },
    experience: { ...defaults.experience, ...content.experience },
    education: { ...defaults.education, ...content.education },
    certifications: { ...defaults.certifications, ...content.certifications },
    languages: { ...defaults.languages, ...content.languages },
    interests: { ...defaults.interests, ...content.interests },
    testimonials: { ...defaults.testimonials, ...content.testimonials },
    contact: { ...defaults.contact, ...content.contact, socials: content.contact?.socials ?? defaults.contact.socials },
    sectionOrder: content.sectionOrder?.length ? Array.from(new Set([...content.sectionOrder, ...defaults.sectionOrder])) : defaults.sectionOrder,
    hiddenSections: content.hiddenSections ?? defaults.hiddenSections,
  };
}

export function emptyContent(): PortfolioContent {
  return {
    hero: { name: "", tagline: "", headshot: "", socials: [] },
    about: { bio: "" },
    skills: { items: [] },
    projects: { items: [] },
    experience: { items: [] },
    education: { items: [] },
    certifications: { items: [] },
    languages: { items: [] },
    interests: { items: [] },
    testimonials: { items: [] },
    contact: { email: "", phone: "", location: "", message: "", socials: [] },
    sectionOrder: [
      "hero",
      "about",
      "skills",
      "projects",
      "experience",
      "education",
      "certifications",
      "languages",
      "interests",
      "testimonials",
      "contact",
    ],
    hiddenSections: [],
  };
}
