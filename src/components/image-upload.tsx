"use client";
import { useState } from "react";
import { toast } from "sonner";

export function ImageUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const authRes = await fetch("/api/imagekit-auth");
      if (!authRes.ok) throw new Error("Auth request failed");
      const auth = await authRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", auth.publicKey);
      formData.append("signature", auth.signature);
      formData.append("expire", auth.expire);
      formData.append("token", auth.token);

      const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onUploaded(data.url);
      toast.success("Photo uploaded");
    } catch (error) {
      console.error("Photo upload failed:", error);
      toast.error("Could not upload photo", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <p className="text-sm text-muted-foreground">আপলোড হচ্ছে...</p>}
    </div>
  );
}