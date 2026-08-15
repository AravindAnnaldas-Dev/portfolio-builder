"use client";

import { ReactNode } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PortfolioContent,
  SectionKey,
  Project,
  Experience,
  Education,
  Certification,
  Language,
  SocialLink,
  Testimonial,
} from "@/types/portfolio";
import { FormField } from "@/components/FormField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/Button";
import { GripIcon } from "@/components/icons";

const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "Hero",
  about: "About",
  skills: "Skills",
  projects: "Projects",
  experience: "Experience",
  education: "Education",
  certifications: "Certifications",
  languages: "Languages",
  interests: "Interests",
  testimonials: "Testimonials",
  contact: "Contact",
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

interface Props {
  content: PortfolioContent;
  onChange: (content: PortfolioContent) => void;
}

// Generic drag handle — visually consistent with SectionCard's icon buttons
// (rounded hit target, muted color, hover tint from the design system).
function DragHandle({ attributes, listeners }: { attributes: any; listeners: any }) {
  return (
    <button
      type="button"
      aria-label="Drag to reorder"
      className="cursor-grab touch-none rounded p-1.5 text-muted hover:bg-border/40 active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripIcon className="h-4 w-4" />
    </button>
  );
}

// Wraps an item row (used for items inside a section list) with sortable
// behavior + a drag handle rendered via `children(handle)`.
function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (handle: ReactNode) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children(<DragHandle attributes={attributes} listeners={listeners} />)}
    </div>
  );
}

function useListDnd<T>(items: T[], getId: (item: T) => string, onChange: (v: T[]) => void) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((it) => getId(it) === active.id);
    const newIndex = items.findIndex((it) => getId(it) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(items, oldIndex, newIndex));
  }
  return { sensors, handleDragEnd };
}

export function EditorForm({ content, onChange }: Props) {
  function update<K extends keyof PortfolioContent>(key: K, value: PortfolioContent[K]) {
    onChange({ ...content, [key]: value });
  }

  function toggleHidden(key: SectionKey) {
    const hidden = content.hiddenSections.includes(key)
      ? content.hiddenSections.filter((k) => k !== key)
      : [...content.hiddenSections, key];
    update("hiddenSections", hidden);
  }

  const sectionSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleSectionDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const order = [...content.sectionOrder];
    const oldIndex = order.indexOf(active.id as SectionKey);
    const newIndex = order.indexOf(over.id as SectionKey);
    if (oldIndex === -1 || newIndex === -1) return;
    update("sectionOrder", arrayMove(order, oldIndex, newIndex));
  }

  function renderSectionBody(key: SectionKey) {
    switch (key) {
      case "hero":
        return (
          <div className="flex flex-col gap-3">
            <FormField label="Name" value={content.hero.name} onChange={(v) => update("hero", { ...content.hero, name: v })} />
            <FormField label="Tagline" value={content.hero.tagline} onChange={(v) => update("hero", { ...content.hero, tagline: v })} />
            <ImageUploadField label="Profile image" value={content.hero.headshot} onChange={(v) => update("hero", { ...content.hero, headshot: v })} />
            <SocialListEditor
              items={content.hero.socials}
              onChange={(items) => update("hero", { ...content.hero, socials: items })}
            />
          </div>
        );
      case "about":
        return <FormField label="Bio" textarea value={content.about.bio} onChange={(v) => update("about", { bio: v })} />;
      case "skills":
        return <TagListEditor label="Skills" items={content.skills.items} onChange={(items) => update("skills", { items })} />;
      case "projects":
        return <ProjectListEditor items={content.projects.items} onChange={(items) => update("projects", { items })} />;
      case "experience":
        return <ExperienceListEditor items={content.experience.items} onChange={(items) => update("experience", { items })} />;
      case "education":
        return <EducationListEditor items={content.education.items} onChange={(items) => update("education", { items })} />;
      case "certifications":
        return (
          <CertificationListEditor
            items={content.certifications.items}
            onChange={(items) => update("certifications", { items })}
          />
        );
      case "languages":
        return <LanguageListEditor items={content.languages.items} onChange={(items) => update("languages", { items })} />;
      case "interests":
        return (
          <TagListEditor label="Interests" items={content.interests.items} onChange={(items) => update("interests", { items })} />
        );
      case "testimonials":
        return (
          <TestimonialListEditor
            items={content.testimonials.items}
            onChange={(items) => update("testimonials", { items })}
          />
        );
      case "contact":
        return (
          <div className="flex flex-col gap-3">
            <FormField label="Email" value={content.contact.email} onChange={(v) => update("contact", { ...content.contact, email: v })} />
            <FormField label="Phone" value={content.contact.phone} onChange={(v) => update("contact", { ...content.contact, phone: v })} />
            <FormField label="Location" value={content.contact.location} onChange={(v) => update("contact", { ...content.contact, location: v })} />
            <FormField label="Message" textarea value={content.contact.message} onChange={(v) => update("contact", { ...content.contact, message: v })} />
            <SocialListEditor
              items={content.contact.socials}
              onChange={(items) => update("contact", { ...content.contact, socials: items })}
            />
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <DndContext sensors={sectionSensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
      <SortableContext items={content.sectionOrder} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-5">
          {content.sectionOrder.map((key) => (
            <SortableItem key={key} id={key}>
              {(handle) => (
                <SectionCard
                  title={SECTION_LABELS[key]}
                  hidden={content.hiddenSections.includes(key)}
                  onToggleHidden={() => toggleHidden(key)}
                  dragHandle={handle}
                >
                  {renderSectionBody(key)}
                </SectionCard>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SocialListEditor({ items, onChange }: { items: SocialLink[]; onChange: (v: SocialLink[]) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted">Social links</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item.label}
            placeholder="Label"
            onChange={(e) => onChange(items.map((it, idx) => (idx === i ? { ...it, label: e.target.value } : it)))}
            className="w-28 rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-text outline-none focus:border-accent"
          />
          <input
            value={item.url}
            placeholder="URL"
            onChange={(e) => onChange(items.map((it, idx) => (idx === i ? { ...it, url: e.target.value } : it)))}
            className="min-w-0 flex-1 rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-text outline-none focus:border-accent"
          />
          <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-xs text-red-500">
            Remove
          </button>
        </div>
      ))}
      <Button variant="secondary" onClick={() => onChange([...items, { label: "", url: "" }])}>
        + Add link
      </Button>
    </div>
  );
}

function TagListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted">{label} (comma-separated)</label>
      <textarea
        rows={2}
        value={items.join(", ")}
        onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
        className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
      />
    </div>
  );
}

// Shared row chrome for sortable list items: drag handle + remove button,
// matching SectionCard's bordered/rounded item styling.
function ItemRow({ dragHandle, onRemove, removeLabel, children }: { dragHandle: ReactNode; onRemove: () => void; removeLabel: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        {dragHandle}
        <button onClick={onRemove} className="text-xs text-red-500">
          {removeLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

function ProjectListEditor({ items, onChange }: { items: Project[]; onChange: (v: Project[]) => void }) {
  const { sensors, handleDragEnd } = useListDnd(items, (p) => p.id, onChange);
  function update(i: number, patch: Partial<Project>) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {items.map((p, i) => (
            <SortableItem key={p.id} id={p.id}>
              {(handle) => (
                <ItemRow dragHandle={handle} onRemove={() => onChange(items.filter((_, idx) => idx !== i))} removeLabel="Remove project">
                  <div className="flex flex-col gap-2">
                    <FormField label="Title" value={p.title} onChange={(v) => update(i, { title: v })} />
                    <FormField label="Description" textarea value={p.description} onChange={(v) => update(i, { description: v })} />
                    <FormField label="Image URL" value={p.image} onChange={(v) => update(i, { image: v })} />
                    <FormField
                      label="Tech stack (comma-separated)"
                      value={p.techStack.join(", ")}
                      onChange={(v) => update(i, { techStack: v.split(",").map((s) => s.trim()).filter(Boolean) })}
                    />
                    <FormField label="Live URL" value={p.liveUrl} onChange={(v) => update(i, { liveUrl: v })} />
                    <FormField label="Repo URL" value={p.repoUrl} onChange={(v) => update(i, { repoUrl: v })} />
                  </div>
                </ItemRow>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
      <Button
        variant="secondary"
        onClick={() =>
          onChange([...items, { id: uid(), title: "", description: "", image: "", techStack: [], liveUrl: "", repoUrl: "" }])
        }
      >
        + Add project
      </Button>
    </DndContext>
  );
}

function ExperienceListEditor({ items, onChange }: { items: Experience[]; onChange: (v: Experience[]) => void }) {
  const { sensors, handleDragEnd } = useListDnd(items, (e) => e.id, onChange);
  function update(i: number, patch: Partial<Experience>) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {items.map((e, i) => (
            <SortableItem key={e.id} id={e.id}>
              {(handle) => (
                <ItemRow dragHandle={handle} onRemove={() => onChange(items.filter((_, idx) => idx !== i))} removeLabel="Remove">
                  <div className="flex flex-col gap-2">
                    <FormField label="Role" value={e.role} onChange={(v) => update(i, { role: v })} />
                    <FormField label="Company" value={e.company} onChange={(v) => update(i, { company: v })} />
                    <div className="flex gap-2">
                      <FormField label="Start" value={e.start} onChange={(v) => update(i, { start: v })} />
                      <FormField label="End" value={e.end} onChange={(v) => update(i, { end: v })} />
                    </div>
                    <FormField label="Description" textarea value={e.description} onChange={(v) => update(i, { description: v })} />
                  </div>
                </ItemRow>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
      <Button
        variant="secondary"
        onClick={() => onChange([...items, { id: uid(), role: "", company: "", start: "", end: "", description: "" }])}
      >
        + Add experience
      </Button>
    </DndContext>
  );
}

function EducationListEditor({ items, onChange }: { items: Education[]; onChange: (v: Education[]) => void }) {
  const { sensors, handleDragEnd } = useListDnd(items, (e) => e.id, onChange);
  function update(i: number, patch: Partial<Education>) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {items.map((e, i) => (
            <SortableItem key={e.id} id={e.id}>
              {(handle) => (
                <ItemRow dragHandle={handle} onRemove={() => onChange(items.filter((_, idx) => idx !== i))} removeLabel="Remove">
                  <div className="flex flex-col gap-2">
                    <FormField label="School" value={e.school} onChange={(v) => update(i, { school: v })} />
                    <FormField label="Degree" value={e.degree} onChange={(v) => update(i, { degree: v })} />
                    <div className="flex gap-2">
                      <FormField label="Start" value={e.start} onChange={(v) => update(i, { start: v })} />
                      <FormField label="End" value={e.end} onChange={(v) => update(i, { end: v })} />
                    </div>
                  </div>
                </ItemRow>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
      <Button variant="secondary" onClick={() => onChange([...items, { id: uid(), school: "", degree: "", start: "", end: "" }])}>
        + Add education
      </Button>
    </DndContext>
  );
}

function CertificationListEditor({ items, onChange }: { items: Certification[]; onChange: (v: Certification[]) => void }) {
  const { sensors, handleDragEnd } = useListDnd(items, (c) => c.id, onChange);
  function update(i: number, patch: Partial<Certification>) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {items.map((c, i) => (
            <SortableItem key={c.id} id={c.id}>
              {(handle) => (
                <ItemRow dragHandle={handle} onRemove={() => onChange(items.filter((_, idx) => idx !== i))} removeLabel="Remove">
                  <div className="flex flex-col gap-2">
                    <FormField label="Name" value={c.name} onChange={(v) => update(i, { name: v })} />
                    <FormField label="Issuer" value={c.issuer} onChange={(v) => update(i, { issuer: v })} />
                    <FormField label="Date" value={c.date} onChange={(v) => update(i, { date: v })} />
                    <FormField label="Credential URL" value={c.url || ""} onChange={(v) => update(i, { url: v })} />
                  </div>
                </ItemRow>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
      <Button
        variant="secondary"
        onClick={() => onChange([...items, { id: uid(), name: "", issuer: "", date: "", url: "" }])}
      >
        + Add certification
      </Button>
    </DndContext>
  );
}

function LanguageListEditor({ items, onChange }: { items: Language[]; onChange: (v: Language[]) => void }) {
  const { sensors, handleDragEnd } = useListDnd(items, (l) => l.id, onChange);
  function update(i: number, patch: Partial<Language>) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {items.map((l, i) => (
            <SortableItem key={l.id} id={l.id}>
              {(handle) => (
                <ItemRow dragHandle={handle} onRemove={() => onChange(items.filter((_, idx) => idx !== i))} removeLabel="Remove">
                  <div className="flex gap-2">
                    <FormField label="Language" value={l.name} onChange={(v) => update(i, { name: v })} />
                    <FormField label="Proficiency" value={l.proficiency} onChange={(v) => update(i, { proficiency: v })} />
                  </div>
                </ItemRow>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
      <Button variant="secondary" onClick={() => onChange([...items, { id: uid(), name: "", proficiency: "" }])}>
        + Add language
      </Button>
    </DndContext>
  );
}

function TestimonialListEditor({ items, onChange }: { items: Testimonial[]; onChange: (v: Testimonial[]) => void }) {
  const { sensors, handleDragEnd } = useListDnd(items, (t) => t.id, onChange);
  function update(i: number, patch: Partial<Testimonial>) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {items.map((t, i) => (
            <SortableItem key={t.id} id={t.id}>
              {(handle) => (
                <ItemRow dragHandle={handle} onRemove={() => onChange(items.filter((_, idx) => idx !== i))} removeLabel="Remove">
                  <div className="flex flex-col gap-2">
                    <FormField label="Author" value={t.author} onChange={(v) => update(i, { author: v })} />
                    <FormField label="Role / Company" value={t.role} onChange={(v) => update(i, { role: v })} />
                    <FormField label="Quote" textarea value={t.quote} onChange={(v) => update(i, { quote: v })} />
                    <FormField label="Avatar URL" value={t.avatar} onChange={(v) => update(i, { avatar: v })} />
                  </div>
                </ItemRow>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
      <Button
        variant="secondary"
        onClick={() => onChange([...items, { id: uid(), author: "", role: "", quote: "", avatar: "" }])}
      >
        + Add testimonial
      </Button>
    </DndContext>
  );
}
