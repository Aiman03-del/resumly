"use client";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { experienceSchema } from "@/types/resume";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { PolishButton } from "@/components/polish-button";

const formSchema = z.object({ items: z.array(experienceSchema) });
type FormValues = z.infer<typeof formSchema>;
type ExperienceItem = FormValues["items"][number];

export function ExperienceStep({
  defaultValues,
  onChange,
}: {
  defaultValues: FormValues["items"];
  onChange: (data: FormValues["items"]) => void;
}) {
  const { register, control, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { items: defaultValues?.length ? defaultValues : [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const [liveItems, setLiveItems] = useState<ExperienceItem[]>(defaultValues?.length ? defaultValues : []);
  const [polishingIndex, setPolishingIndex] = useState<number | null>(null);

  useEffect(() => {
    const subscription = watch((value) => {
      const items = (value.items ?? []) as ExperienceItem[];
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

  return (
    <div className="space-y-5">
      <h2 className="text-lg sm:text-xl font-semibold">Work Experience</h2>

      {fields.map((field, index) => {
        const row = liveItems[index];
        const hasDescription = (row?.description ?? "").trim().length > 0;

        return (
        <div key={field.id} className="p-4 rounded-xl border border-border space-y-3 relative">
          <button
            type="button"
            onClick={() => handleRemove(index)}
            disabled={polishingIndex !== null}
            className="absolute top-3 right-3 text-foreground/40 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Trash2 size={16} />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Company</label>
              <input
                {...register(`items.${index}.company`)}
                className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <input
                {...register(`items.${index}.role`)}
                className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input
                {...register(`items.${index}.startDate`)}
                type="month"
                className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date (leave blank if current)</label>
              <input
                {...register(`items.${index}.endDate`)}
                type="month"
                className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Description</label>
              {hasDescription && (
                <PolishButton
                  section="experience-description"
                  content={row?.description}
                  context={{ role: row?.role, company: row?.company }}
                  onPolished={(text) => setValue(`items.${index}.description`, text)}
                  onLoadingChange={(loading) => setPolishingIndex(loading ? index : null)}
                />
              )}
            </div>
            <div className="relative mt-1">
              <textarea
                {...register(`items.${index}.description`)}
                rows={3}
                readOnly={polishingIndex === index}
                className="w-full min-w-0 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base resize-y"
                placeholder="What did you do and achieve in this role?"
              />
              {polishingIndex === index && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-background/80 backdrop-blur-[1px] text-sm text-foreground/70">
                  <Loader2 size={16} className="animate-spin" />
                  Polishing your description…
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })}

      <button
        type="button"
        onClick={() => append({ company: "", role: "", startDate: "", endDate: "", description: "" })}
        className="flex items-center gap-1.5 text-sm text-primary font-medium"
      >
        <Plus size={16} /> Add Experience
      </button>
    </div>
  );
}