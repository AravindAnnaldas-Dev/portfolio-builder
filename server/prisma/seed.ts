import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("Aravind@897", 10);

  const user = await prisma.user.upsert({
    where: { email: "annaldasaravind897@gmail.com" },
    update: {},
    create: {
      email: "annaldasaravind897@gmail.com",
      password,
      name: "Aravind Annaldas",
    },
  });

  const content = {
    hero: {
      name: "Aravind Annaldas",
      tagline: "Frontend Software Engineer | React.js · Next.js · TypeScript · JavaScript",
      headshot: "https://i.pravatar.cc/300?u=aravind-annaldas",
      socials: [
        { label: "GitHub", url: "https://github.com/AravindAnnaldas-Dev" },
        { label: "LinkedIn", url: "https://linkedin.com/in/aravindannaldas" },
      ],
    },
    about: {
      bio:
        "Frontend engineer with close to 3 years of experience building React.js and Next.js applications in TypeScript. For the past two years I have been the sole frontend developer on a travel booking platform spanning flights, hotels, and trains, owning the full path from REST API and GDS integration through multi-step booking flows, authentication, and the final UI. My work centers on frontend architecture, reusable component design, responsive design, and performance optimization, using React Query for data fetching and Tailwind CSS for styling within a small Agile team. I am currently expanding into backend development, building REST APIs with Node.js and Express and working with PostgreSQL, SQL, and Prisma ORM to grow toward full stack development.",
    },
    skills: {
      items: [
        "JavaScript (ES6+)",
        "TypeScript",
        "SQL",
        "HTML5",
        "CSS3",
        "React.js",
        "Next.js",
        "Tailwind CSS",
        "Material UI",
        "Framer Motion",
        "React Query",
        "Context API",
        "REST APIs",
        "Axios",
        "Postman",
        "Lazy Loading",
        "Code Splitting",
        "Memoization",
        "JWT",
        "Node.js",
        "Express.js",
        "PostgreSQL",
        "Prisma ORM",
        "Git",
        "GitHub",
      ],
    },
    projects: {
      items: [
        {
          id: "p1",
          title: "Resume Builder Application",
          description:
            "Built a resume builder with live preview and PDF export, using several templates that share one common component structure so a change in one place flows through all of them.",
          image: "https://picsum.photos/seed/resume-builder/640/400",
          techStack: ["React.js", "TypeScript", "Tailwind CSS"],
          liveUrl: "",
          repoUrl: "https://github.com/AravindAnnaldas-Dev",
        },
        {
          id: "p2",
          title: "E-commerce Admin Dashboard",
          description:
            "Built an admin dashboard for products, orders, and users with full CRUD, plus pagination, search, sorting, and form validation, using reusable table components and cached API data.",
          image: "https://picsum.photos/seed/admin-dashboard/640/400",
          techStack: ["Next.js", "TypeScript", "Material UI"],
          liveUrl: "",
          repoUrl: "https://github.com/AravindAnnaldas-Dev",
        },
      ],
    },
    experience: {
      items: [
        {
          id: "e1",
          role: "Frontend Software Engineer",
          company: "Enspirit Technologies",
          start: "Sep 2023",
          end: "Present",
          description:
            "Sole frontend developer on a travel booking platform covering flights, hotels, and trains, collaborating cross-functionally with four backend engineers and a full-stack developer on a team of around 9 to 11. Built booking flows end to end across every vertical — search, filtered results, passenger and guest detail forms, fare rules, and checkout — through component-driven development. Integrated third-party travel and GDS RESTful services using React Query, Axios, and Context API. Set up the full frontend authentication flow including login, protected routes, token handling, and session management. Improved load time on heavy search-results and booking screens by roughly 20 to 30 percent through lazy loading, code splitting, and memoization. Built responsive, accessible interfaces with Tailwind CSS and Material UI following WCAG practices. Mentored two junior developers on the codebase.",
        },
      ],
    },
    education: {
      items: [
        {
          id: "ed1",
          school: "Vidya Jyothi Institute of Technology, Hyderabad, Telangana",
          degree: "Bachelor of Engineering, Electrical and Electronics Engineering",
          start: "Aug 2019",
          end: "May 2023",
        },
      ],
    },
    certifications: { items: [] },
    languages: {
      items: [{ id: "l1", name: "English", proficiency: "Fluent" }],
    },
    interests: { items: [] },
    testimonials: { items: [] },
    contact: {
      email: "annaldasaravind897@gmail.com",
      phone: "+91-9963213997",
      location: "Hyderabad, Telangana, India",
      message: "Interested in working together? Reach out any time.",
      socials: [
        { label: "GitHub", url: "https://github.com/AravindAnnaldas-Dev" },
        { label: "LinkedIn", url: "https://linkedin.com/in/aravindannaldas" },
      ],
    },
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
    hiddenSections: ["certifications", "languages", "interests", "testimonials"],
  };

  await prisma.portfolio.upsert({
    where: { slug: "aravind-annaldas-portfolio" },
    update: {},
    create: {
      userId: user.id,
      title: "Aravind Annaldas — Frontend Software Engineer Portfolio",
      slug: "aravind-annaldas-portfolio",
      template: "minimal-dev",
      content,
    },
  });

  console.log("Seeded annaldasaravind897@gmail.com / Aravind@897");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
