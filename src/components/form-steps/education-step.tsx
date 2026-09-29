"use client";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

interface EducationItem {
  institution: string;
  degree: string;
  startDate: string;
  endDate?: string;
}

export function EducationStep({
  defaultValues,
  onChange,
}: {
  defaultValues: EducationItem[];
  onChange: (data: EducationItem[]) => void;
}) {
  const { register, control, getValues, subscribe } = useForm<{ items: EducationItem[] }>({
    defaultValues: { items: defaultValues?.length ? defaultValues : [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    return subscribe({
      formState: { values: true },
      callback: ({ values }) => onChange((values.items ?? []) as EducationItem[]),
    });
  }, [subscribe, onChange]);

  function handleRemove(index: number) {
    remove(index);
    onChange(getValues("items"));
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg sm:text-xl font-semibold">Education</h2>

      {fields.map((field, index) => (
        <div key={field.id} className="p-4 rounded-xl border border-border space-y-3 relative">
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="absolute top-3 right-3 text-foreground/40 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Institution</label>
              <input
                {...register(`items.${index}.institution`)}
                className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="University name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Degree</label>
              <input
                {...register(`items.${index}.degree`)}
                className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="B.Sc. in Computer Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input {...register(`items.${index}.startDate`)} type="month"
                className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <input {...register(`items.${index}.endDate`)} type="month"
                className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ institution: "", degree: "", startDate: "", endDate: "" })}
        className="flex items-center gap-1.5 text-sm text-primary font-medium"
      >
        <Plus size={16} /> Add Education
      </button>
    </div>
  );
}