"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { languageSchema } from "@/types/resume";
import { Plus, Trash2 } from "lucide-react";

const formSchema = z.object({
  items: z.array(languageSchema),
});

type FormValues = z.infer<typeof formSchema>;

export function LanguagesStep({
  defaultValues,
  onChange,
}: {
  defaultValues: FormValues["items"];
  onChange: (data: FormValues["items"]) => void;
}) {
  const { register, control, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: defaultValues?.length ? defaultValues : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      onChange((value.items ?? []) as FormValues["items"]);
    });

    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">Languages</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add languages and your proficiency level.
        </p>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="relative rounded-xl border border-border p-4"
        >
          <button
            type="button"
            onClick={() => remove(index)}
            className="absolute right-3 top-3 text-foreground/40 hover:text-red-500"
            aria-label={`Remove language ${index + 1}`}
          >
            <Trash2 size={16} />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-7">
            <div>
              <label className="text-sm font-medium">Language</label>
              <input
                {...register(`items.${index}.name`)}
                placeholder="English"
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Proficiency</label>
              <select
                {...register(`items.${index}.proficiency`)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background"
              >
                <option value="">Select level</option>
                <option value="Native">Native</option>
                <option value="Fluent">Fluent</option>
                <option value="Advanced">Advanced</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Basic">Basic</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ name: "", proficiency: "" })}
        className="flex items-center gap-1.5 text-sm text-primary font-medium"
      >
        <Plus size={16} />
        Add Language
      </button>
    </div>
  );
}