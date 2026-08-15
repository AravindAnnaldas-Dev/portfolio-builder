import { PortfolioContent, TemplateId, normalizeContent } from "@/types/portfolio";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function visibleOrder(content: PortfolioContent): string[] {
  return content.sectionOrder.filter((k) => !content.hiddenSections.includes(k));
}

const RENDERERS: Record<string, (c: PortfolioContent) => string> = {
  hero: (c) => `<section class="section hero" id="hero">
    ${c.hero.headshot ? `<img class="headshot" src="${esc(c.hero.headshot)}" alt="${esc(c.hero.name)}" onerror="this.style.display='none'" />` : ""}
    <h1>${esc(c.hero.name || "Your Name")}</h1>
    <p class="tagline">${esc(c.hero.tagline)}</p>
    <div class="socials">${c.hero.socials.map((s) => `<a href="${esc(s.url)}">${esc(s.label)}</a>`).join("")}</div>
  </section>`,
  about: (c) => `<section class="section about" id="about"><h2>About</h2><p>${esc(c.about.bio)}</p></section>`,
  skills: (c) => `<section class="section skills" id="skills"><h2>Skills</h2><ul class="skill-list">${c.skills.items
    .map((s) => `<li>${esc(s)}</li>`)
    .join("")}</ul></section>`,
  projects: (c) => `<section class="section projects" id="projects"><h2>Projects</h2><div class="project-grid">${c.projects.items
    .map(
      (p) => `<div class="project-card">
      ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" onerror="this.style.display='none'" />` : ""}
      <h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>
      <div class="tech-stack">${p.techStack.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <div class="project-links">
        ${p.liveUrl ? `<a href="${esc(p.liveUrl)}">Live</a>` : ""}
        ${p.repoUrl ? `<a href="${esc(p.repoUrl)}">Code</a>` : ""}
      </div></div>`
    )
    .join("")}</div></section>`,
  experience: (c) => `<section class="section experience" id="experience"><h2>Experience</h2>${c.experience.items
    .map(
      (e) => `<div class="experience-item"><h3>${esc(e.role)} · ${esc(e.company)}</h3><p class="dates">${esc(
        e.start
      )} — ${esc(e.end || "Present")}</p><p>${esc(e.description)}</p></div>`
    )
    .join("")}</section>`,
  education: (c) => `<section class="section education" id="education"><h2>Education</h2>${c.education.items
    .map(
      (e) => `<div class="education-item"><h3>${esc(e.degree)} · ${esc(e.school)}</h3><p class="dates">${esc(
        e.start
      )} — ${esc(e.end || "Present")}</p></div>`
    )
    .join("")}</section>`,
  certifications: (c) => `<section class="section certifications" id="certifications"><h2>Certifications</h2><div class="certification-list">${c.certifications.items
    .map(
      (item) => `<div class="certification-item"><h3>${esc(item.name)}</h3><p class="dates">${esc(item.issuer)} · ${esc(
        item.date
      )}</p>${item.url ? `<a href="${esc(item.url)}">View credential</a>` : ""}</div>`
    )
    .join("")}</div></section>`,
  languages: (c) => `<section class="section languages" id="languages"><h2>Languages</h2><ul class="language-list">${c.languages.items
    .map((l) => `<li><strong>${esc(l.name)}</strong> — ${esc(l.proficiency)}</li>`)
    .join("")}</ul></section>`,
  interests: (c) => `<section class="section interests" id="interests"><h2>Interests</h2><ul class="skill-list">${c.interests.items
    .map((i) => `<li>${esc(i)}</li>`)
    .join("")}</ul></section>`,
  testimonials: (c) => `<section class="section testimonials" id="testimonials"><h2>Testimonials</h2><div class="testimonial-list">${c.testimonials.items
    .map(
      (t) => `<div class="testimonial-item">
      ${t.avatar ? `<img class="testimonial-avatar" src="${esc(t.avatar)}" alt="${esc(t.author)}" onerror="this.style.display='none'" />` : ""}
      <p class="quote">&ldquo;${esc(t.quote)}&rdquo;</p>
      <p class="author">${esc(t.author)}${t.role ? ` · ${esc(t.role)}` : ""}</p>
    </div>`
    )
    .join("")}</div></section>`,
  contact: (c) => `<section class="section contact" id="contact"><h2>Contact</h2>
    ${c.contact.message ? `<p class="contact-message">${esc(c.contact.message)}</p>` : ""}
    <div class="contact-details">
      ${c.contact.email ? `<p><a href="mailto:${esc(c.contact.email)}">${esc(c.contact.email)}</a></p>` : ""}
      ${c.contact.phone ? `<p>${esc(c.contact.phone)}</p>` : ""}
      ${c.contact.location ? `<p>${esc(c.contact.location)}</p>` : ""}
    </div>
    <div class="socials">${c.contact.socials.map((s) => `<a href="${esc(s.url)}">${esc(s.label)}</a>`).join("")}</div>
  </section>`,
};

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

const CSS: Record<TemplateId, string> = {
  "minimal-dev": `${BASE_RESET}
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
`,
  "creative-grid": `${BASE_RESET}
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
`,
  "single-page-scroll": `${BASE_RESET}
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
`,
  "sidebar-profile": `${BASE_RESET}
body{display:flex;min-height:100vh}
.sidebar{width:280px;background:linear-gradient(180deg,#111827,#1f2937);color:#fff;padding:3rem 2rem;flex-shrink:0}
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
@media (max-width:800px){body{flex-direction:column}.sidebar{width:100%;height:auto}.project-grid,.certification-list,.testimonial-list{grid-template-columns:1fr}}
`,
};

// Just the <body> markup for a template — used to patch an already-loaded
// preview iframe's DOM directly (see PreviewPane) instead of replacing the
// whole document, so content edits update instantly with no reload/flicker.
export function renderPortfolioBody(template: TemplateId, rawContent: PortfolioContent): string {
  const content = normalizeContent(rawContent);
  const order = visibleOrder(content);

  if (template === "sidebar-profile") {
    const hero = RENDERERS.hero(content);
    const rest = order.filter((k) => k !== "hero").map((k) => RENDERERS[k](content)).join("");
    return `<div class="sidebar">${hero}</div><div class="main">${rest}</div>`;
  }
  return order.map((k) => RENDERERS[k](content)).join("");
}

export function renderPortfolioHtml(template: TemplateId, title: string, rawContent: PortfolioContent): string {
  const body = renderPortfolioBody(template, rawContent);
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${esc(title)}</title><style>${CSS[template]}</style></head><body>${body}</body></html>`;
}
