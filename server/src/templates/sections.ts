import { PortfolioContent } from "../types";
import { escapeHtml } from "./shared";

// One render function per section key. All four templates call the same
// functions — a template only differs in CSS/layout, never in how a
// section's data is turned into markup. That's what keeps "add a template"
// from requiring "rewrite content logic."

export function renderHero(content: PortfolioContent): string {
  const { name, tagline, headshot, socials } = content.hero;
  return `<section class="section hero" id="hero">
  ${headshot ? `<img class="headshot" src="${escapeHtml(headshot)}" alt="${escapeHtml(name)}" onerror="this.style.display='none'" />` : ""}
  <h1>${escapeHtml(name)}</h1>
  <p class="tagline">${escapeHtml(tagline)}</p>
  <div class="socials">
    ${socials.map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`).join("\n")}
  </div>
</section>`;
}

export function renderAbout(content: PortfolioContent): string {
  return `<section class="section about" id="about">
  <h2>About</h2>
  <p>${escapeHtml(content.about.bio)}</p>
</section>`;
}

export function renderSkills(content: PortfolioContent): string {
  return `<section class="section skills" id="skills">
  <h2>Skills</h2>
  <ul class="skill-list">
    ${content.skills.items.map((s) => `<li>${escapeHtml(s)}</li>`).join("\n")}
  </ul>
</section>`;
}

export function renderProjects(content: PortfolioContent): string {
  return `<section class="section projects" id="projects">
  <h2>Projects</h2>
  <div class="project-grid">
    ${content.projects.items
      .map(
        (p) => `<div class="project-card">
      ${p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" onerror="this.style.display='none'" />` : ""}
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.description)}</p>
      <div class="tech-stack">${p.techStack.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>
      <div class="project-links">
        ${p.liveUrl ? `<a href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noopener">Live</a>` : ""}
        ${p.repoUrl ? `<a href="${escapeHtml(p.repoUrl)}" target="_blank" rel="noopener">Code</a>` : ""}
      </div>
    </div>`
      )
      .join("\n")}
  </div>
</section>`;
}

export function renderExperience(content: PortfolioContent): string {
  return `<section class="section experience" id="experience">
  <h2>Experience</h2>
  ${content.experience.items
    .map(
      (e) => `<div class="experience-item">
    <h3>${escapeHtml(e.role)} · ${escapeHtml(e.company)}</h3>
    <p class="dates">${escapeHtml(e.start)} — ${escapeHtml(e.end || "Present")}</p>
    <p>${escapeHtml(e.description)}</p>
  </div>`
    )
    .join("\n")}
</section>`;
}

export function renderEducation(content: PortfolioContent): string {
  return `<section class="section education" id="education">
  <h2>Education</h2>
  ${content.education.items
    .map(
      (e) => `<div class="education-item">
    <h3>${escapeHtml(e.degree)} · ${escapeHtml(e.school)}</h3>
    <p class="dates">${escapeHtml(e.start)} — ${escapeHtml(e.end || "Present")}</p>
  </div>`
    )
    .join("\n")}
</section>`;
}

export function renderCertifications(content: PortfolioContent): string {
  return `<section class="section certifications" id="certifications">
  <h2>Certifications</h2>
  <div class="certification-list">
    ${content.certifications.items
      .map(
        (c) => `<div class="certification-item">
      <h3>${escapeHtml(c.name)}</h3>
      <p class="dates">${escapeHtml(c.issuer)} · ${escapeHtml(c.date)}</p>
      ${c.url ? `<a href="${escapeHtml(c.url)}" target="_blank" rel="noopener">View credential</a>` : ""}
    </div>`
      )
      .join("\n")}
  </div>
</section>`;
}

export function renderLanguages(content: PortfolioContent): string {
  return `<section class="section languages" id="languages">
  <h2>Languages</h2>
  <ul class="language-list">
    ${content.languages.items
      .map((l) => `<li><strong>${escapeHtml(l.name)}</strong> — ${escapeHtml(l.proficiency)}</li>`)
      .join("\n")}
  </ul>
</section>`;
}

export function renderInterests(content: PortfolioContent): string {
  return `<section class="section interests" id="interests">
  <h2>Interests</h2>
  <ul class="skill-list">
    ${content.interests.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("\n")}
  </ul>
</section>`;
}

export function renderTestimonials(content: PortfolioContent): string {
  return `<section class="section testimonials" id="testimonials">
  <h2>Testimonials</h2>
  <div class="testimonial-list">
    ${content.testimonials.items
      .map(
        (t) => `<div class="testimonial-item">
      ${t.avatar ? `<img class="testimonial-avatar" src="${escapeHtml(t.avatar)}" alt="${escapeHtml(t.author)}" onerror="this.style.display='none'" />` : ""}
      <p class="quote">&ldquo;${escapeHtml(t.quote)}&rdquo;</p>
      <p class="author">${escapeHtml(t.author)}${t.role ? ` &middot; ${escapeHtml(t.role)}` : ""}</p>
    </div>`
      )
      .join("\n")}
  </div>
</section>`;
}

export function renderContact(content: PortfolioContent): string {
  const { email, phone, location, message, socials } = content.contact;
  return `<section class="section contact" id="contact">
  <h2>Contact</h2>
  ${message ? `<p class="contact-message">${escapeHtml(message)}</p>` : ""}
  <div class="contact-details">
    ${email ? `<p><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>` : ""}
    ${phone ? `<p>${escapeHtml(phone)}</p>` : ""}
    ${location ? `<p>${escapeHtml(location)}</p>` : ""}
  </div>
  <div class="socials">
    ${socials.map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`).join("\n")}
  </div>
</section>`;
}

export const SECTION_RENDERERS: Record<string, (content: PortfolioContent) => string> = {
  hero: renderHero,
  about: renderAbout,
  skills: renderSkills,
  projects: renderProjects,
  experience: renderExperience,
  education: renderEducation,
  certifications: renderCertifications,
  languages: renderLanguages,
  interests: renderInterests,
  testimonials: renderTestimonials,
  contact: renderContact,
};
