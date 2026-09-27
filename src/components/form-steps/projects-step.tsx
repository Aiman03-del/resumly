"use client";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Wand2, Loader2 } from "lucide-react";
import { PolishButton } from "@/components/polish-button";
import { toast } from "sonner";

const projectItemSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string(),
  link: z
    .string()
    .trim()
    .refine((value) => value === "" || /^https?:\/\/.+\..+/.test(value), {
      message: "Enter a valid link (e.g. https://example.com)",
    })
    .optional(),
});

const formSchema = z.object({ items: z.array(projectItemSchema) });
type FormValues = z.infer<typeof formSchema>;
type ProjectItem = FormValues["items"][number];

export function ProjectsStep({
  defaultValues,
  onChange,
}: {
  defaultValues: ProjectItem[];
  onChange: (data: ProjectItem[]) => void;
}) {
  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: { items: defaultValues?.length ? defaultValues : [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const [liveItems, setLiveItems] = useState<ProjectItem[]>(defaultValues?.length ? defaultValues : []);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

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

  async function handleGenerateFromLink(index: number) {
    const valid = await trigger(`items.${index}.link`);
    if (!valid) return;

    const link = liveItems[index]?.link;
    if (!link) {
      toast.error("Add a project link first");
      return;
    }

    setGeneratingIndex(index);
    try {
      const response = await fetch("/api/project-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link, name: liveItems[index]?.name }),
      });
      const result = await response.json() as { description?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not fetch link");
      setValue(`items.${index}.description`, result.description ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error: unknown) {
      toast.error("Could not generate from link", {
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

        return (
          <div key={field.id} className="p-4 rounded-xl border border-border space-y-3 relative">
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-3 right-3 text-foreground/40 hover:text-red-500"
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
              <label className="text-sm font-medium">Link</label>
              <div className="flex gap-2 mt-1">
                <input
                  {...register(`items.${index}.link`)}
                  onBlur={() => trigger(`items.${index}.link`)}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="https://github.com/username/project"
                />
                <button
                  type="button"
                  onClick={() => handleGenerateFromLink(index)}
                  disabled={generatingIndex === index}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors text-xs font-medium disabled:opacity-60"
                  title="Generate description from this link using AI"
                >
                  {generatingIndex === index ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Wand2 size={14} />
                  )}
                  Fetch
                </button>
              </div>
              {errors.items?.[index]?.link && (
                <p className="text-xs text-red-500 mt-1">{errors.items[index]?.link?.message}</p>
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
                  />
                )}
              </div>
              <textarea
                {...register(`items.${index}.description`)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="What does this project do?"
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => append({ name: "", description: "", link: "" })}
        className="flex items-center gap-1.5 text-sm text-primary font-medium"
      >
        <Plus size={16} /> Add Project
      </button>
    </div>
  );
}