"use client";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Wand2, Loader2, Link2, X } from "lucide-react";
import { PolishButton } from "@/components/polish-button";
import { toast } from "sonner";

const MAX_LINKS = 5;

const linkSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\/.+\..+/.test(value), {
    message: "Enter a valid link (e.g. https://example.com)",
  });

const projectItemSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string(),
  links: z.array(linkSchema).max(MAX_LINKS).optional(),
});

const formSchema = z.object({ items: z.array(projectItemSchema) });
type FormValues = z.infer<typeof formSchema>;
type ProjectItem = FormValues["items"][number];
type InitialProjectItem = ProjectItem & { link?: string };

function withLinks(item: InitialProjectItem): ProjectItem {
  return {
    name: item.name,
    description: item.description,
    links: item.links?.length ? item.links : item.link ? [item.link] : [""],
  };
}

export function ProjectsStep({
  defaultValues,
  onChange,
}: {
  defaultValues: InitialProjectItem[];
  onChange: (data: ProjectItem[]) => void;
}) {
  const initialItems = defaultValues?.length ? defaultValues.map(withLinks) : [];

  const {
    register,
    control,
    watch,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: { items: initialItems },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const [liveItems, setLiveItems] = useState<ProjectItem[]>(initialItems);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [polishingIndex, setPolishingIndex] = useState<number | null>(null);

  useEffect(() => {
    const subscription = watch((value) => {
      const items = (value.items ?? []) as ProjectItem[];
      onChange(items);
      setLiveItems(items);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  function handleRemove(index: number) {
    remove(index);
    const updated = liveItems.filter((_, itemIndex) => itemIndex !== index);
    setLiveItems(updated);
    onChange(updated);
  }

  function handleAddLink(index: number) {
    const current = getValues(`items.${index}.links`) ?? [];
    if (current.length >= MAX_LINKS) return;
    setValue(`items.${index}.links`, [...current, ""], { shouldDirty: true });
  }

  function handleRemoveLink(index: number, linkIndex: number) {
    const current = getValues(`items.${index}.links`) ?? [];
    const updated = current.filter((_, currentIndex) => currentIndex !== linkIndex);
    setValue(`items.${index}.links`, updated.length ? updated : [""], { shouldDirty: true });
    void trigger(`items.${index}.links`);
  }

  function handleLinkChange(index: number, linkIndex: number, value: string) {
    setValue(`items.${index}.links.${linkIndex}`, value, { shouldDirty: true });
  }

  async function handleGenerateFromLink(index: number) {
    const name = liveItems[index]?.name;
    const links = (liveItems[index]?.links ?? [])
      .map((link) => link?.trim())
      .filter((link): link is string => Boolean(link));

    if (links.length) {
      const valid = await trigger(`items.${index}.links`);
      if (!valid) return;
    }

    if (!links.length && !name) {
      toast.error("Add a project name or link first");
      return;
    }

    setGeneratingIndex(index);
    try {
      const response = await fetch("/api/project-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links, name }),
      });
      const result = await response.json() as { description?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not generate description");
      setValue(`items.${index}.description`, result.description ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error: unknown) {
      toast.error("Could not generate description", {
        description: error instanceof Error ? error.message : "Please try again in a moment.",
      });
    } finally {
      setGeneratingIndex(null);
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Projects</h2>

      {fields.map((field, index) => {
        const row = liveItems[index];
        const hasDescription = (row?.description ?? "").trim().length > 0;
        const links = row?.links?.length ? row.links : [""];
        const linksError = errors.items?.[index]?.links;
        const busy = generatingIndex === index || polishingIndex === index;

        return (
          <div key={field.id} className="p-4 rounded-xl border border-border space-y-3 relative">
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={generatingIndex !== null || polishingIndex !== null}
              className="absolute top-3 right-3 text-foreground/40 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none"
              aria-label={`Remove project ${row?.name || index + 1}`}
            >
              <Trash2 size={16} />
            </button>

            <div>
              <label className="text-sm font-medium">Project Name</label>
              <input
                {...register(`items.${index}.name`)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="Resumly"
              />
              {errors.items?.[index]?.name && (
                <p className="text-xs text-red-500 mt-1">{errors.items[index]?.name?.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Links</label>
                {links.length < MAX_LINKS && (
                  <button
                    type="button"
                    onClick={() => handleAddLink(index)}
                    className="flex items-center gap-1 text-xs text-primary font-medium"
                  >
                    <Plus size={12} /> Add link
                  </button>
                )}
              </div>
              <div className="space-y-2 mt-1">
                {links.map((linkValue, linkIndex) => (
                  <div key={linkIndex} className="flex gap-2">
                    <div className="flex-1 min-w-0 relative">
                      <Link2
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none"
                      />
                      <input
                        value={linkValue ?? ""}
                        onChange={(event) => handleLinkChange(index, linkIndex, event.target.value)}
                        onBlur={() => void trigger(`items.${index}.links`)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background"
                        placeholder={linkIndex === 0 ? "https://github.com/username/project" : "https://your-live-demo.com"}
                      />
                    </div>
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index, linkIndex)}
                        className="shrink-0 px-2 text-foreground/40 hover:text-red-500"
                        aria-label="Remove this link"
                      >
                        <X size={16} />
                      </button>
                    )}
                    {linkIndex === 0 && (
                      <button
                        type="button"
                        onClick={() => handleGenerateFromLink(index)}
                        disabled={generatingIndex === index}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors text-xs font-medium disabled:opacity-60"
                        title="Generate description using AI from these links (links optional)"
                      >
                        {generatingIndex === index ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Wand2 size={14} />
                        )}
                        Fetch
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {linksError && (
                <p className="text-xs text-red-500 mt-1">Enter a valid link (e.g. https://example.com)</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Description</label>
                {hasDescription && (
                  <PolishButton
                    section="project-description"
                    content={row?.description}
                    onPolished={(text) => setValue(`items.${index}.description`, text)}
                    onLoadingChange={(loading) => setPolishingIndex(loading ? index : null)}
                  />
                )}
              </div>
              <div className="relative">
                <textarea
                  {...register(`items.${index}.description`)}
                  rows={2}
                  readOnly={busy}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="What does this project do?"
                />
                {busy && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-background/80 backdrop-blur-[1px] text-sm text-foreground/70">
                    <Loader2 size={16} className="animate-spin" />
                    {generatingIndex === index
                      ? "Writing a description from your project…"
                      : "Polishing your description…"}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => append({ name: "", description: "", links: [""] })}
        className="flex items-center gap-1.5 text-sm text-primary font-medium"
      >
        <Plus size={16} /> Add Project
      </button>
    </div>
  );
}