"use client";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema, PersonalInfo } from "@/types/resume";
import { ImageUpload } from "@/components/image-upload";
import { commonRoles } from "@/lib/common-roles";

export function PersonalInfoStep({
  defaultValues,
  onChange,
  onValidityChange,
}: {
  defaultValues: Partial<PersonalInfo>;
  onChange: (data: PersonalInfo) => void;
  onValidityChange: (valid: boolean) => void;
}) {
  const {
    register,
    control,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues,
  });

  const values = useWatch({ control }) as PersonalInfo;

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  useEffect(() => {
    trigger();
  }, [trigger]);

  // Push changes up on every change
  const handleBlur = () => onChange(values as PersonalInfo);

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold">Personal Information</h2>

      <ImageUpload
        value={values.photoUrl}
        onUploaded={(url) => {
          setValue("photoUrl", url);
          onChange({ ...values, photoUrl: url });
        }}
        onRemoved={() => {
          setValue("photoUrl", undefined);
          onChange({ ...values, photoUrl: undefined });
        }}
      />

      <div>
        <label className="text-sm font-medium">Full Name</label>
        <input
          {...register("fullName")}
          onBlur={handleBlur}
          className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="John Doe"
        />
        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Role / Title</label>
        <input
          {...register("role")}
          onBlur={handleBlur}
          list="role-suggestions"
          className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="e.g. Web Developer, Graphic Designer"
        />
        <datalist id="role-suggestions">
          {commonRoles.map((role) => (
            <option key={role} value={role} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            {...register("email")}
            onBlur={handleBlur}
            className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input
            {...register("phone")}
            onBlur={handleBlur}
            className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="+880 1XXXXXXXXX"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Location</label>
        <input
          {...register("location")}
          onBlur={handleBlur}
          className="w-full min-w-0 mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Dhaka, Bangladesh"
        />
      </div>

    </div>
  );
}