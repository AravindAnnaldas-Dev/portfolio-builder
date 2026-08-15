import { z } from "zod";

// Restricts URL-ish fields to safe schemes so a value like `javascript:...`
// can't be stored and later written verbatim into an href in the exported
// static site or the live preview iframe. Empty string is allowed since most
// of these fields are optional.
const safeUrl = z
  .string()
  .refine((v) => v === "" || /^(https?:|mailto:|tel:)/i.test(v), {
    message: "URL must start with http:, https:, mailto:, or tel:",
  });

export const SocialLinkSchema = z.object({
  label: z.string(),
  url: safeUrl,
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string().optional().default(""),
  techStack: z.array(z.string()).default([]),
  liveUrl: safeUrl.optional().default(""),
  repoUrl: safeUrl.optional().default(""),
});

export const ExperienceSchema = z.object({
  id: z.string(),
  role: z.string(),
  company: z.string(),
  start: z.string(),
  end: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

export const EducationSchema = z.object({
  id: z.string(),
  school: z.string(),
  degree: z.string(),
  start: z.string(),
  end: z.string().optional().default(""),
});

export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  url: safeUrl.optional().default(""),
});

export const LanguageSchema = z.object({
  id: z.string(),
  name: z.string(),
  proficiency: z.string(),
});

export const TestimonialSchema = z.object({
  id: z.string(),
  author: z.string(),
  role: z.string().optional().default(""),
  quote: z.string(),
  avatar: safeUrl.optional().default(""),
});

export const SectionKey = z.enum([
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
]);

export const PortfolioContentSchema = z.object({
  hero: z.object({
    name: z.string(),
    tagline: z.string().default(""),
    headshot: z.string().optional().default(""),
    socials: z.array(SocialLinkSchema).default([]),
  }),
  about: z.object({ bio: z.string().default("") }),
  skills: z.object({ items: z.array(z.string()).default([]) }),
  projects: z.object({ items: z.array(ProjectSchema).default([]) }),
  experience: z.object({ items: z.array(ExperienceSchema).default([]) }),
  education: z.object({ items: z.array(EducationSchema).default([]) }),
  certifications: z.object({ items: z.array(CertificationSchema).default([]) }),
  languages: z.object({ items: z.array(LanguageSchema).default([]) }),
  interests: z.object({ items: z.array(z.string()).default([]) }),
  testimonials: z.object({ items: z.array(TestimonialSchema).default([]) }),
  contact: z.object({
    email: z.string().email().optional().or(z.literal("")).default(""),
    phone: z.string().optional().default(""),
    location: z.string().optional().default(""),
    message: z.string().optional().default(""),
    socials: z.array(SocialLinkSchema).default([]),
  }),
  // Order + visibility of top-level sections; templates render according to this.
  sectionOrder: z.array(SectionKey).default([
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
  ]),
  hiddenSections: z.array(SectionKey).default([]),
});

export type PortfolioContent = z.infer<typeof PortfolioContentSchema>;

export const TEMPLATES = [
  "minimal-dev",
  "creative-grid",
  "single-page-scroll",
  "sidebar-profile",
] as const;
export type TemplateId = (typeof TEMPLATES)[number];

export const PortfolioCreateSchema = z.object({
  title: z.string().min(1),
  template: z.enum(TEMPLATES).default("minimal-dev"),
  content: PortfolioContentSchema,
});

export const PortfolioUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  template: z.enum(TEMPLATES).optional(),
  content: PortfolioContentSchema.optional(),
});
