"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema, PersonalInfo } from "@/types/resume";
import { ImageUpload } from "@/components/image-upload";

export function PersonalInfoStep({
  defaultValues,
  onChange,
}: {
  defaultValues: Partial<PersonalInfo>;
  onChange: (data: PersonalInfo) => void;
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
  });

  const values = watch();

  // Push changes up on every change
  const handleBlur = () => onChange(values as PersonalInfo);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Personal Information</h2>

      <div>
        <label className="text-sm font-medium">Full Name</label>
        <input
          {...register("fullName")}
          onBlur={handleBlur}
          className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
          placeholder="John Doe"
        />
        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            {...register("email")}
            onBlur={handleBlur}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input
            {...register("phone")}
            onBlur={handleBlur}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
            placeholder="+880 1XXXXXXXXX"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Location</label>
        <input
          {...register("location")}
          onBlur={handleBlur}
          className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
          placeholder="Dhaka, Bangladesh"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Profile Photo</label>
        <ImageUpload onUploaded={(url) => { setValue("photoUrl", url); onChange({ ...values, photoUrl: url }); }} />
      </div>
    </div>
  );
}