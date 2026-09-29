"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { certificationSchema } from "@/types/resume";
import { Plus, Trash2 } from "lucide-react";

const formSchema = z.object({
  items: z.array(certificationSchema),
});

type FormValues = z.infer<typeof formSchema>;

export function CertificationsStep({
  defaultValues,
  onChange,
}: {
  defaultValues: FormValues["items"];
  onChange: (data: FormValues["items"]) => void;
}) {
  const { register, control, subscribe } = useForm<FormValues>({
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
    return subscribe({
      formState: { values: true },
      callback: ({ values }) => onChange((values.items ?? []) as FormValues["items"]),
    });
  }, [subscribe, onChange]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">Certifications</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add professional certifications and credentials.
        </p>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="relative rounded-xl border border-border p-4 space-y-3"
        >
          <button
            type="button"
            onClick={() => remove(index)}
            className="absolute right-3 top-3 text-foreground/40 hover:text-red-500"
            aria-label={`Remove certification ${index + 1}`}
          >
            <Trash2 size={16} />
          </button>

          <div>
            <label className="text-sm font-medium">Certification Name</label>
            <input
              {...register(`items.${index}.name`)}
              placeholder="AWS Certified Developer"
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Issuing Organization</label>
            <input
              {...register(`items.${index}.issuer`)}
              placeholder="Amazon Web Services"
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Issue Date</label>
              <input
                {...register(`items.${index}.issueDate`)}
                type="month"
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Expiry Date</label>
              <input
                {...register(`items.${index}.expiryDate`)}
                type="month"
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Credential ID</label>
            <input
              {...register(`items.${index}.credentialId`)}
              placeholder="ABC-123456"
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Credential URL</label>
            <input
              {...register(`items.${index}.credentialUrl`)}
              type="url"
              placeholder="https://..."
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({
            name: "",
            issuer: "",
            issueDate: "",
            expiryDate: "",
            credentialId: "",
            credentialUrl: "",
          })
        }
        className="flex items-center gap-1.5 text-sm text-primary font-medium"
      >
        <Plus size={16} />
        Add Certification
      </button>
    </div>
  );
}