"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewResumePage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function createResume() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("resumes")
        .insert({ user_id: user.id, title: "Untitled Resume" })
        .select()
        .single();

      if (error) {
        console.error("Failed to create resume:", error);
        toast.error("Could not create resume", { description: error.message });
        router.push("/dashboard");
        return;
      }

      router.replace(`/builder/${data.id}`);
    }

    createResume();
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={24} />
    </div>
  );
}