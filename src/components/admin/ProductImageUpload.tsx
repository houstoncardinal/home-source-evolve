import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Star, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface ProductImageUploadProps {
  productId: string;
  images: { id: string; url: string; is_primary: boolean; display_order: number }[];
  onImagesChange: () => void;
}

export function ProductImageUpload({ productId, images, onImagesChange }: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);

        const isPrimary = images.length === 0;
        const { error: dbError } = await supabase.from("product_images").insert({
          product_id: productId,
          url: publicUrl,
          is_primary: isPrimary,
          display_order: images.length,
          alt_text: file.name.replace(/\.[^/.]+$/, ""),
        });

        if (dbError) throw dbError;
      }

      toast.success(`${files.length} image(s) uploaded`);
      onImagesChange();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSetPrimary = async (imageId: string) => {
    // Unset all, then set selected
    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
    await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);
    toast.success("Primary image updated");
    onImagesChange();
  };

  const handleDelete = async (imageId: string, url: string) => {
    try {
      // Extract path from URL
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/product-images\/(.+)$/);
      if (pathMatch) {
        await supabase.storage.from("product-images").remove([pathMatch[1]]);
      }
      await supabase.from("product_images").delete().eq("id", imageId);
      toast.success("Image deleted");
      onImagesChange();
    } catch {
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Product Images</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
          Upload
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images
            .sort((a, b) => a.display_order - b.display_order)
            .map((img) => (
              <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-700">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    className={`p-1.5 rounded ${img.is_primary ? "bg-amber-500 text-black" : "bg-white/20 text-white hover:bg-white/30"}`}
                    title="Set as primary"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(img.id, img.url)}
                    className="p-1.5 rounded bg-red-500/80 text-white hover:bg-red-500"
                    title="Delete"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {img.is_primary && (
                  <div className="absolute top-1 left-1 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                    PRIMARY
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-slate-600" />
          <p className="text-xs text-slate-500">No images yet. Upload product photos.</p>
        </div>
      )}
    </div>
  );
}
