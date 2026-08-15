import { PortfolioContent, TemplateId } from "../types";
import { baseDocument, orderedSections } from "./shared";
import { SECTION_RENDERERS } from "./sections";

const BASE_RESET = `
*{box-sizing:border-box;margin:0;padding:0;overflow-wrap:break-word;min-width:0}
html{-webkit-text-size-adjust:100%}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;line-height:1.65;color:#1a1a1a;background:#fff;overflow-x:hidden}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none;transition:opacity .15s ease,color .15s ease}
.section{padding:clamp(1rem,2.5vw,1.75rem) clamp(1.25rem,5vw,2rem)}
h1,h2,h3{line-height:1.2;letter-spacing:-.02em}
.skill-list li,.tech-stack span{max-width:100%}
`;

function minimalDevCss() {
  return `${BASE_RESET}
.section{max-width:760px;margin:0 auto}
.hero{text-align:left;padding-top:clamp(2rem,6vw,3.5rem)}
.headshot{width:96px;height:96px;border-radius:50%;object-fit:cover;margin-bottom:1.5rem;box-shadow:0 0 0 4px #eef2ff}
h1{font-size:clamp(2rem,5vw,2.5rem);font-weight:700;color:#111827}
.tagline{color:#4b5563;font-size:clamp(1rem,2vw,1.15rem);margin-top:.6rem}
.socials{margin-top:1.25rem;display:flex;flex-wrap:wrap;gap:1.25rem}
.socials a{font-size:.9rem;font-weight:600;color:#4f46e5}
.socials a:hover{opacity:.7}
h2{font-size:clamp(1.3rem,3vw,1.5rem);font-weight:700;margin-bottom:1.75rem;padding-bottom:.6rem;border-bottom:2px solid #e5e7eb;color:#111827}
.skill-list{list-style:none;display:flex;flex-wrap:wrap;gap:.6rem}
.skill-list li{background:#eef2ff;color:#4338ca;font-weight:600;padding:.4rem .9rem;border-radius:999px;font-size:.85rem}
.project-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
.project-card{border:1px solid #e5e7eb;border-radius:14px;padding:1.5rem;background:#fff;transition:box-shadow .2s ease,transform .2s ease}
.project-card:hover{box-shadow:0 12px 24px -12px rgba(17,24,39,.15);transform:translateY(-3px)}
.project-card h3{font-size:1.05rem;margin-bottom:.5rem}
.project-card p{color:#4b5563}
.tech-stack{display:flex;gap:.4rem;flex-wrap:wrap;margin:.9rem 0}
.tech-stack span{font-size:.75rem;background:#f3f4f6;color:#374151;padding:.25rem .65rem;border-radius:6px;font-weight:500}
.project-links a{margin-right:1.25rem;font-size:.9rem;font-weight:600;color:#4f46e5}
.project-links a:hover{opacity:.7}
.experience-item,.education-item{margin-bottom:1.75rem}
.experience-item h3,.education-item h3{font-size:1.05rem;margin-bottom:.3rem}
.dates{color:#6b7280;font-size:.85rem;margin-bottom:.5rem}
.certification-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.25rem}
.certification-item{border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;background:#fff}
.certification-item a{color:#4f46e5;font-weight:600;font-size:.9rem}
.language-list{list-style:none;display:flex;flex-direction:column;gap:.6rem}
.testimonial-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
.testimonial-item{border:1px solid #e5e7eb;border-radius:14px;padding:1.5rem;background:#fafafa}
.testimonial-avatar{width:48px;height:48px;border-radius:50%;object-fit:cover;margin-bottom:.75rem}
.quote{font-style:italic;color:#374151}
.author{margin-top:.6rem;font-size:.85rem;color:#6b7280;font-weight:600}
.contact-message{margin-bottom:1.25rem;color:#4b5563;font-size:1.05rem}
.contact-details p{margin-bottom:.5rem}
.contact-details a{color:#4f46e5;font-weight:600}
.contact-details a:hover{opacity:.7}
.contact .socials a{color:#4f46e5;font-weight:600;text-decoration:none}
@media (max-width:600px){.hero{padding-top:3rem}.project-grid,.certification-list,.testimonial-list{grid-template-columns:1fr}}
`;
}

function creativeGridCss() {
  return `${BASE_RESET}
body{background:#0b0b12;color:#f5f5f7}
.section{max-width:1080px;margin:0 auto}
.hero{text-align:center;padding-top:clamp(2rem,6vw,3.5rem)}
.headshot{width:120px;height:120px;border-radius:24px;object-fit:cover;margin:0 auto 1.75rem;box-shadow:0 0 0 4px rgba(255,255,255,.08)}
h1{font-size:clamp(2.1rem,6vw,3.25rem);font-weight:800;background:linear-gradient(90deg,#8b5cf6,#ec4899,#f59e0b);-webkit-background-clip:text;background-clip:text;color:transparent}
.tagline{color:#a1a1aa;font-size:clamp(1rem,2.5vw,1.2rem);margin-top:.6rem;max-width:560px;margin-left:auto;margin-right:auto}
.socials{margin-top:1.5rem;display:flex;flex-wrap:wrap;gap:1.25rem;justify-content:center}
.socials a{font-size:.9rem;font-weight:600;color:#f0abfc;border-bottom:1px solid transparent}
.socials a:hover{color:#fff}
h2{font-size:clamp(1.4rem,3.5vw,1.85rem);font-weight:800;margin-bottom:2rem;text-align:center}
.skill-list{list-style:none;display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center}
.skill-list li{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);padding:.45rem 1.05rem;border-radius:999px;font-size:.85rem;font-weight:500}
.project-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
.project-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:1.6rem;transition:transform .2s ease,border-color .2s ease}
.project-card:hover{transform:translateY(-5px);border-color:rgba(236,72,153,.5)}
.project-card h3{font-size:1.1rem;margin-bottom:.5rem}
.project-card p{color:#c4c4cc}
.tech-stack{display:flex;gap:.4rem;flex-wrap:wrap;margin:.9rem 0}
.tech-stack span{font-size:.75rem;background:rgba(255,255,255,.08);padding:.25rem .65rem;border-radius:6px}
.project-links a{margin-right:1.25rem;font-size:.9rem;font-weight:600;color:#f59e0b}
.project-links a:hover{color:#fff}
.experience-item,.education-item{margin-bottom:1.75rem;text-align:center}
.experience-item h3,.education-item h3{font-size:1.05rem}
.dates{color:#9ca3af;font-size:.85rem;margin:.3rem 0 .5rem}
.certification-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
.certification-item{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:1.5rem;text-align:center}
.certification-item a{color:#f59e0b;font-weight:600}
.language-list{list-style:none;display:flex;flex-direction:column;gap:.5rem;align-items:center}
.testimonial-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
.testimonial-item{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:1.6rem;text-align:center}
.testimonial-avatar{width:56px;height:56px;border-radius:50%;object-fit:cover;margin:0 auto .75rem}
.quote{font-style:italic;color:#e4e4e7}
.author{margin-top:.6rem;font-size:.85rem;color:#a1a1aa;font-weight:600}
.contact-message{margin-bottom:1.25rem;color:#c4c4cc;text-align:center;font-size:1.05rem}
.contact-details{text-align:center}
.contact-details p{margin-bottom:.5rem}
.contact-details a{color:#f0abfc}
@media (max-width:600px){.project-grid,.certification-list,.testimonial-list{grid-template-columns:1fr}}
`;
}

function singlePageScrollCss() {
  return `${BASE_RESET}
.section{max-width:920px;margin:0 auto;scroll-snap-align:start}
html{scroll-behavior:smooth}
body{scroll-snap-type:y proximity}
.hero{text-align:center}
.headshot{width:140px;height:140px;border-radius:50%;object-fit:cover;margin:0 auto 1.75rem;box-shadow:0 0 0 6px #f4f4f5}
h1{font-size:clamp(2.2rem,7vw,3.5rem);font-weight:800;color:#111827}
.tagline{color:#52525b;font-size:clamp(1.05rem,2.5vw,1.3rem);margin-top:.85rem;max-width:600px;margin-left:auto;margin-right:auto}
.socials{margin-top:1.75rem;display:flex;flex-wrap:wrap;gap:1.5rem;justify-content:center}
.socials a{color:#111827;font-weight:700;border-bottom:2px solid #111827}
.socials a:hover{opacity:.65}
h2{font-size:clamp(1.5rem,4vw,2rem);font-weight:800;margin-bottom:2rem;text-align:center}
.skill-list{list-style:none;display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center}
.skill-list li{background:#f4f4f5;font-weight:600;padding:.45rem 1rem;border-radius:8px;font-size:.9rem}
.project-grid{display:grid;gap:2rem}
.project-card{padding:1.75rem;border:1px solid #e4e4e7;border-radius:16px;transition:box-shadow .2s ease}
.project-card:hover{box-shadow:0 12px 24px -12px rgba(17,24,39,.15)}
.project-card h3{font-size:1.15rem;margin-bottom:.5rem}
.project-card p{color:#52525b}
.tech-stack{display:flex;gap:.4rem;flex-wrap:wrap;margin:.9rem 0}
.tech-stack span{font-size:.75rem;background:#f4f4f5;padding:.25rem .65rem;border-radius:6px;font-weight:500}
.project-links a{margin-right:1.25rem;font-weight:700;color:#111827;border-bottom:1px solid #111827}
.experience-item,.education-item{margin-bottom:1.75rem;text-align:center}
.experience-item h3,.education-item h3{font-size:1.1rem}
.dates{color:#71717a;font-size:.85rem;margin:.4rem 0 .5rem}
.certification-list{display:grid;gap:1.5rem}
.certification-item{padding:1.5rem;border:1px solid #e4e4e7;border-radius:16px;text-align:center}
.certification-item a{color:#111827;font-weight:700;border-bottom:1px solid #111827}
.language-list{list-style:none;display:flex;flex-direction:column;gap:.6rem;align-items:center}
.testimonial-list{display:grid;gap:2rem}
.testimonial-item{padding:1.75rem;border:1px solid #e4e4e7;border-radius:16px;text-align:center}
.testimonial-avatar{width:56px;height:56px;border-radius:50%;object-fit:cover;margin:0 auto .75rem}
.quote{font-style:italic;color:#3f3f46;font-size:1.05rem}
.author{margin-top:.6rem;font-size:.85rem;color:#71717a;font-weight:600}
.contact-message{margin-bottom:1.25rem;color:#52525b;text-align:center;font-size:1.1rem}
.contact-details{text-align:center}
.contact-details p{margin-bottom:.5rem}
.contact-details a{font-weight:700;border-bottom:1px solid currentColor}
`;
}

function sidebarProfileCss() {
  return `${BASE_RESET}
body{display:flex;min-height:100vh}
.sidebar{width:280px;background:linear-gradient(180deg,#111827,#1f2937);color:#fff;padding:3rem 2rem;position:sticky;top:0;height:100vh;flex-shrink:0}
.sidebar .headshot{width:100px;height:100px;border-radius:50%;object-fit:cover;margin-bottom:1.4rem;box-shadow:0 0 0 4px rgba(255,255,255,.12)}
.sidebar h1{font-size:1.6rem;font-weight:700}
.sidebar .tagline{color:#9ca3af;font-size:.95rem;margin-top:.6rem}
.sidebar .socials{margin-top:1.5rem;display:flex;flex-direction:column;gap:.6rem}
.sidebar .socials a{color:#7dd3fc;font-size:.85rem;font-weight:600}
.sidebar .socials a:hover{color:#fff}
.main{flex:1;padding:clamp(1.5rem,4vw,2.5rem);background:#fafafa;min-width:0}
.main .section{max-width:720px;padding-left:0;padding-right:0}
h2{font-size:1.4rem;font-weight:700;margin-bottom:1.4rem;color:#111827}
.skill-list{list-style:none;display:flex;flex-wrap:wrap;gap:.6rem}
.skill-list li{background:#eef2ff;color:#4338ca;font-weight:600;padding:.4rem .9rem;border-radius:999px;font-size:.85rem}
.project-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem}
.project-card{border:1px solid #e5e7eb;border-radius:14px;padding:1.5rem;background:#fff;transition:box-shadow .2s ease,transform .2s ease}
.project-card:hover{box-shadow:0 12px 24px -12px rgba(17,24,39,.15);transform:translateY(-3px)}
.project-card h3{font-size:1.05rem;margin-bottom:.5rem}
.project-card p{color:#4b5563}
.tech-stack{display:flex;gap:.4rem;flex-wrap:wrap;margin:.9rem 0}
.tech-stack span{font-size:.75rem;background:#f3f4f6;color:#374151;padding:.25rem .65rem;border-radius:6px;font-weight:500}
.project-links a{margin-right:1.25rem;font-weight:600;color:#4f46e5}
.project-links a:hover{opacity:.7}
.experience-item,.education-item{margin-bottom:1.75rem}
.experience-item h3,.education-item h3{font-size:1.05rem;margin-bottom:.3rem}
.dates{color:#6b7280;font-size:.85rem;margin-bottom:.5rem}
.certification-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem}
.certification-item{border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;background:#fff}
.certification-item a{color:#4f46e5;font-weight:600;font-size:.9rem}
.language-list{list-style:none;display:flex;flex-direction:column;gap:.6rem}
.testimonial-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem}
.testimonial-item{border:1px solid #e5e7eb;border-radius:14px;padding:1.5rem;background:#fff}
.testimonial-avatar{width:48px;height:48px;border-radius:50%;object-fit:cover;margin-bottom:.75rem}
.quote{font-style:italic;color:#374151}
.author{margin-top:.6rem;font-size:.85rem;color:#6b7280;font-weight:600}
.contact-message{margin-bottom:1.25rem;color:#4b5563}
.contact-details p{margin-bottom:.5rem}
.contact-details a{color:#4f46e5;font-weight:600}
@media (max-width:800px){body{flex-direction:column}.sidebar{width:100%;height:auto;position:static}.project-grid,.certification-list,.testimonial-list{grid-template-columns:1fr}}
`;
}

export function renderTemplate(template: TemplateId, title: string, content: PortfolioContent): string {
  const sectionKeys = orderedSections(content);
  const body = sectionKeys.map((key) => SECTION_RENDERERS[key](content)).join("\n");

  if (template === "sidebar-profile") {
    const heroHtml = SECTION_RENDERERS.hero(content);
    const rest = sectionKeys.filter((k) => k !== "hero").map((key) => SECTION_RENDERERS[key](content)).join("\n");
    const wrapped = `<div class="sidebar">${heroHtml}</div><div class="main">${rest}</div>`;
    return baseDocument(title, sidebarProfileCss(), wrapped);
  }

  const cssByTemplate: Record<TemplateId, string> = {
    "minimal-dev": minimalDevCss(),
    "creative-grid": creativeGridCss(),
    "single-page-scroll": singlePageScrollCss(),
    "sidebar-profile": sidebarProfileCss(),
  };

  return baseDocument(title, cssByTemplate[template], body);
}
