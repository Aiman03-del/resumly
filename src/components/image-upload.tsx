"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2, X } from "lucide-react";

export function ImageUpload({
  value,
  onUploaded,
  onRemoved,
}: {
  value?: string;
  onUploaded: (url: string) => void;
  onRemoved?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  async function handleUpload(file: File) {
    setLocalPreview(URL.createObjectURL(file));
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
      setLocalPreview(null);
      toast.error("Could not upload photo", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    setLocalPreview(null);
    onRemoved?.();
  }

  const preview = localPreview ?? value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload profile photo"
          className="group relative w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-border bg-muted flex items-center justify-center hover:border-primary transition-colors disabled:cursor-not-allowed"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Profile photo preview" className="w-full h-full object-cover" />
          ) : (
            <Camera size={28} className="text-muted-foreground group-hover:text-primary transition-colors" />
          )}
          {uploading && (
            <span className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 size={24} className="text-white animate-spin" />
            </span>
          )}
        </button>

        {preview && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove photo"
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {uploading ? "Uploading..." : preview ? "Click the photo to change it" : "Click to upload a photo"}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => event.target.files?.[0] && handleUpload(event.target.files[0])}
        disabled={uploading}
      />
    </div>
  );
}