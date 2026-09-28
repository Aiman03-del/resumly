"use client";

import { useEffect } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import type { ResumeData } from "@/types/resume";

const achievementSchema = z.object({
  title: z.string().min(1),
  organization: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

const awardSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

const publicationSchema = z.object({
  title: z.string().min(1),
  publisher: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
});

const courseSchema = z.object({
  name: z.string().min(1),
  provider: z.string().optional(),
  date: z.string().optional(),
  credentialUrl: z.string().optional(),
  description: z.string().optional(),
});

const schemas = {
  achievements: achievementSchema,
  awards: awardSchema,
  publications: publicationSchema,
  courses: courseSchema,
};

const config = {
  achievements: {
    title: "Achievements",
    description: "Highlight important accomplishments and milestones.",
    add: "Add Achievement",
  },
  awards: {
    title: "Awards & Honors",
    description: "Show awards, recognitions and honors.",
    add: "Add Award",
  },
  publications: {
    title: "Publications",
    description: "Add articles, papers, books or other publications.",
    add: "Add Publication",
  },
  courses: {
    title: "Courses / Training",
    description: "Add relevant courses and professional training.",
    add: "Add Course",
  },
} as const;

type SectionType = keyof typeof schemas;

type AdditionalItem =
  | z.input<typeof achievementSchema>
  | z.input<typeof awardSchema>
  | z.input<typeof publicationSchema>
  | z.input<typeof courseSchema>;

type FormValues = { items: AdditionalItem[] };

type SectionData = Pick<ResumeData, SectionType>;

type AdditionalSectionStepProps<T extends SectionType> = {
  type: T;
  defaultValues: SectionData[T];
  onChange: (data: SectionData[T]) => void;
};

export function AdditionalSectionStep<T extends SectionType>({
  type,
  defaultValues,
  onChange,
}: AdditionalSectionStepProps<T>) {
  const schema = schemas[type];

  const formSchema = z.object({
    items: z.array(schema),
  });

  const { register, control, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      items: defaultValues?.length
        ? defaultValues as AdditionalItem[]
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      onChange((value.items ?? []) as unknown as SectionData[T]);
    });

    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const item = (index: number) => {
    if (type === "achievements") {
      return (
        <>
          <Field label="Achievement" {...register(`items.${index}.title`)} placeholder="Employee of the Year" />
          <Field label="Organization" {...register(`items.${index}.organization`)} placeholder="Company / Organization" />
          <Field label="Date" {...register(`items.${index}.date`)} type="month" />
          <TextArea label="Description" {...register(`items.${index}.description`)} placeholder="Describe the achievement..." />
        </>
      );
    }

    if (type === "awards") {
      return (
        <>
          <Field label="Award / Honor" {...register(`items.${index}.title`)} placeholder="Best Developer Award" />
          <Field label="Issuer" {...register(`items.${index}.issuer`)} placeholder="Organization" />
          <Field label="Date" {...register(`items.${index}.date`)} type="month" />
          <TextArea label="Description" {...register(`items.${index}.description`)} placeholder="Describe the award..." />
        </>
      );
    }

    if (type === "publications") {
      return (
        <>
          <Field label="Publication Title" {...register(`items.${index}.title`)} placeholder="Building Better Web Applications" />
          <Field label="Publisher" {...register(`items.${index}.publisher`)} placeholder="Medium / Journal / Publisher" />
          <Field label="Publication Date" {...register(`items.${index}.date`)} type="month" />
          <Field label="URL" {...register(`items.${index}.url`)} placeholder="https://..." />
          <TextArea label="Description" {...register(`items.${index}.description`)} placeholder="Brief description..." />
        </>
      );
    }

    return (
      <>
        <Field label="Course / Training" {...register(`items.${index}.name`)} placeholder="Advanced React Development" />
        <Field label="Provider" {...register(`items.${index}.provider`)} placeholder="Coursera / Udemy / Google" />
        <Field label="Completion Date" {...register(`items.${index}.date`)} type="month" />
        <Field label="Credential URL" {...register(`items.${index}.credentialUrl`)} placeholder="https://..." />
        <TextArea label="Description" {...register(`items.${index}.description`)} placeholder="What did you learn?" />
      </>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">{config[type].title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {config[type].description}
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
            aria-label={`Remove ${config[type].title.toLowerCase()} item ${index + 1}`}
          >
            <Trash2 size={16} />
          </button>

          <div className="space-y-3 pr-7">{item(index)}</div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          if (type === "achievements") {
            append({ title: "", organization: "", date: "", description: "" });
          }

          if (type === "awards") {
            append({ title: "", issuer: "", date: "", description: "" });
          }

          if (type === "publications") {
            append({ title: "", publisher: "", date: "", url: "", description: "" });
          }

          if (type === "courses") {
            append({ name: "", provider: "", date: "", credentialUrl: "", description: "" });
          }
        }}
        className="flex items-center gap-1.5 text-sm text-primary font-medium"
      >
        <Plus size={16} />
        {config[type].add}
      </button>
    </div>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background"
      />
    </div>
  );
}

function TextArea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <textarea
        {...props}
        rows={3}
        className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background resize-y"
      />
    </div>
  );
}