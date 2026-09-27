"use client";
import { useEffect } from "react";
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

  useEffect(() => {
    const subscription = watch((value) => {
      onChange((value.items ?? []) as ProjectItem[]);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  function handleRemove(index: number) {
    remove(index);
    onChange(watch("items"));
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Projects</h2>

      {fields.map((field, index) => (
        <div key={field.id} className="p-4 rounded-xl border border-border space-y-3 relative">
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="absolute top-3 right-3 text-foreground/40 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>

          <div>
            <label className="text-sm font-medium">Project Name</label>
            <input {...register(`items.${index}.name`)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="Resumly" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea {...register(`items.${index}.description`)} rows={2}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="What does this project do?" />
          </div>
          <div>
            <label className="text-sm font-medium">Link (optional)</label>
            <input {...register(`items.${index}.link`)}
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