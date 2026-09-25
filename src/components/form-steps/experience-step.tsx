"use client";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { experienceSchema } from "@/types/resume";
import { Plus, Trash2 } from "lucide-react";

const formSchema = z.object({ items: z.array(experienceSchema) });
type FormValues = z.infer<typeof formSchema>;

export function ExperienceStep({
  defaultValues,
  onChange,
}: {
  defaultValues: FormValues["items"];
  onChange: (data: FormValues["items"]) => void;
}) {
  const { register, control, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { items: defaultValues?.length ? defaultValues : [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const values = watch("items");
  const sync = () => onChange(values);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Work Experience</h2>

      {fields.map((field, index) => (
        <div key={field.id} className="p-4 rounded-xl border border-border space-y-3 relative">
          <button
            type="button"
            onClick={() => { remove(index); sync(); }}
            className="absolute top-3 right-3 text-foreground/40 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Company</label>
              <input
                {...register(`items.${index}.company`)}
                onBlur={sync}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <input
                {...register(`items.${index}.role`)}
                onBlur={sync}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input
                {...register(`items.${index}.startDate`)}
                onBlur={sync}
                type="month"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date (leave blank if current)</label>
              <input
                {...register(`items.${index}.endDate`)}
                onBlur={sync}
                type="month"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              {...register(`items.${index}.description`)}
              onBlur={sync}
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="What did you do and achieve in this role?"
            />
          </div>
        </div>
      ))}

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