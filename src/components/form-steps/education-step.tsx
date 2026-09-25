"use client";
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
  const { register, control, watch } = useForm<{ items: EducationItem[] }>({
    defaultValues: { items: defaultValues?.length ? defaultValues : [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const values = watch("items");
  const sync = () => onChange(values);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Education</h2>

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
              <label className="text-sm font-medium">Institution</label>
              <input
                {...register(`items.${index}.institution`)}
                onBlur={sync}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="University name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Degree</label>
              <input
                {...register(`items.${index}.degree`)}
                onBlur={sync}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="B.Sc. in Computer Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input {...register(`items.${index}.startDate`)} onBlur={sync} type="month"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <input {...register(`items.${index}.endDate`)} onBlur={sync} type="month"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background" />
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