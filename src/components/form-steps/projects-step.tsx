"use client";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

interface ProjectItem {
  name: string;
  description: string;
  link?: string;
}

export function ProjectsStep({
  defaultValues,
  onChange,
}: {
  defaultValues: ProjectItem[];
  onChange: (data: ProjectItem[]) => void;
}) {
  const { register, control, watch } = useForm<{ items: ProjectItem[] }>({
    defaultValues: { items: defaultValues?.length ? defaultValues : [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const values = watch("items");
  const sync = () => onChange(values);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Projects</h2>

      {fields.map((field, index) => (
        <div key={field.id} className="p-4 rounded-xl border border-border space-y-3 relative">
          <button
            type="button"
            onClick={() => { remove(index); sync(); }}
            className="absolute top-3 right-3 text-foreground/40 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>

          <div>
            <label className="text-sm font-medium">Project Name</label>
            <input {...register(`items.${index}.name`)} onBlur={sync}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="Resumly" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea {...register(`items.${index}.description`)} onBlur={sync} rows={2}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="What does this project do?" />
          </div>
          <div>
            <label className="text-sm font-medium">Link (optional)</label>
            <input {...register(`items.${index}.link`)} onBlur={sync}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="https://..." />
          </div>
        </div>
      ))}

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