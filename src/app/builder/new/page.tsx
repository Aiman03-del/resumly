"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function NewResumePage() {
  const router = useRouter();
  const supabase = createClient();
  const hasCreated = useRef(false); // guards against Strict Mode double-invoke

  useEffect(() => {
    if (hasCreated.current) return;
    hasCreated.current = true;

    async function createResume() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("resumes")
        .insert({ user_id: user.id, title: "Untitled Resume" })
        .select()
        .single();

      if (error) {
        toast.error("Could not create resume", { description: error.message });
        router.replace("/dashboard");
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