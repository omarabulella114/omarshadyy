"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Loader2, Film, Palette, Upload, X, Check,
  Eye, EyeOff, ChevronRight, Image as ImageIcon, Video, Globe
} from "lucide-react";

type ProjectFormProps = {
  projectId?: string;
};

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 transition-colors text-sm";
const labelClass = "block text-xs font-semibold tracking-[0.15em] uppercase text-gray-400 mb-2";

export default function ProjectForm({ projectId }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [initialLoad, setInitialLoad] = useState(!!projectId);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const ogInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [galleryImages, setGalleryImages] = useState<{ id?: string, image_url: string, display_order: number }[]>([]);
  const [deletedGalleryImages, setDeletedGalleryImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "film" as "film" | "creative",
    role: "",
    year: new Date().getFullYear().toString(),
    video_url: "",
    video_file_url: "",
    video_orientation: "horizontal" as "horizontal" | "vertical",
    cover_image_url: "",
    cover_position: "center" as string,
    is_published: false,
    meta_title: "",
    meta_description: "",
    og_image_url: "",
  });

  useEffect(() => {
    if (projectId) fetchProject();
  }, [projectId]);

  async function fetchProject() {
    const { data } = await supabase.from("projects").select("*").eq("id", projectId).single();
    if (data) {
      setFormData({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "film",
        role: data.role || "",
        year: data.year || "",
        video_url: data.video_url || "",
        video_file_url: data.video_file_url || "",
        video_orientation: data.video_orientation || "horizontal",
        cover_image_url: data.cover_image_url || "",
        cover_position: data.cover_position || "center",
        is_published: data.is_published || false,
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        og_image_url: data.og_image_url || "",
      });
    }

    const { data: images } = await supabase
      .from("project_images")
      .select("*")
      .eq("project_id", projectId)
      .order("display_order", { ascending: true });

    if (images) {
      setGalleryImages(images.map((img: any) => ({
        id: img.id,
        image_url: img.image_url,
        display_order: img.display_order
      })));
    }

    setInitialLoad(false);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as any;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const uploadFile = async (file: File, field: string) => {
    if (!file) return;

    setUploadingField(field);
    setUploadProgress(10);

    try {
      // 1. Get presigned URL from our API
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to get upload URL");
      setUploadProgress(30);

      // 2. Upload directly to Cloudflare R2
      const uploadRes = await fetch(data.presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload to Cloudflare R2");
      setUploadProgress(80);

      // 3. Save the public URL to form data
      setFormData((prev) => ({ ...prev, [field]: data.publicUrl }));
      setUploadProgress(100);
    } catch (error: any) {
      console.error(error);
      alert("Upload failed: " + error.message);
    } finally {
      setTimeout(() => {
        setUploadingField(null);
        setUploadProgress(0);
      }, 600);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files?.[0]) return;
    await uploadFile(e.target.files[0], field);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    setUploadingField("gallery");
    setUploadProgress(10);
    
    const newImages = [...galleryImages];
    const total = files.length;
    let completed = 0;

    for (const file of files) {
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, fileType: file.type }),
        });
        const data = await res.json();
        
        if (res.ok) {
          const uploadRes = await fetch(data.presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (uploadRes.ok) {
            newImages.push({ image_url: data.publicUrl, display_order: newImages.length });
          }
        }
      } catch (error) {
        console.error("Gallery image upload failed:", error);
      }
      
      completed++;
      setUploadProgress(10 + Math.floor((completed / total) * 80));
    }
    
    setGalleryImages(newImages);
    setUploadProgress(100);
    setTimeout(() => {
      setUploadingField(null);
      setUploadProgress(0);
    }, 600);
  };

  const handleDrop = async (e: React.DragEvent, field: string) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file) await uploadFile(file, field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let submitError;
    let newProjectId = projectId;

    if (projectId) {
      const { error } = await supabase.from("projects").update(formData).eq("id", projectId);
      submitError = error;
    } else {
      const { data, error } = await supabase.from("projects").insert([formData]).select().single();
      submitError = error;
      if (data) newProjectId = data.id;
    }

    if (!submitError && newProjectId) {
      // 1. Delete removed gallery images
      if (deletedGalleryImages.length > 0) {
        await supabase.from("project_images").delete().in("id", deletedGalleryImages);
      }

      // 2. Insert new or update existing gallery images
      if (galleryImages.length > 0) {
        const upsertData = galleryImages.map((img, idx) => ({
          ...(img.id ? { id: img.id } : {}), // only include ID if it exists
          project_id: newProjectId,
          image_url: img.image_url,
          display_order: idx, // reorder based on current array position
        }));
        await supabase.from("project_images").upsert(upsertData);
      } else {
        // If they cleared the whole gallery but didn't track deletions properly
        await supabase.from("project_images").delete().eq("project_id", newProjectId);
      }
    }

    setLoading(false);
    if (submitError) {
      alert("Error saving project: " + submitError.message);
    } else {
      setSaved(true);
      setTimeout(() => { window.location.href = "/admin/projects"; }, 800);
    }
  };

  if (initialLoad)
    return (
      <div className="flex items-center gap-3 text-gray-500 py-20">
        <Loader2 className="animate-spin" size={20} />
        <span className="text-sm tracking-wider">Loading project...</span>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">

      {/* ── Step 1: Category Picker ───────────────────────── */}
      <section className="bg-white/3 border border-white/10 rounded-2xl p-8">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-500 mb-6">
          1 — Project Type
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "film", label: "Film", sub: "Cinematic, documentary, commercial", Icon: Film },
            { value: "creative", label: "Creative", sub: "Photography, art, visual projects", Icon: Palette },
          ].map(({ value, label, sub, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData((p) => ({ ...p, category: value as any }))}
              className={`flex items-center gap-5 p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                formData.category === value
                  ? "border-white bg-white/10"
                  : "border-white/10 hover:border-white/30 bg-white/3"
              }`}
            >
              <div className={`p-3 rounded-lg ${formData.category === value ? "bg-white text-black" : "bg-white/5 text-gray-400"}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className={`font-bold text-lg tracking-wide ${formData.category === value ? "text-white" : "text-gray-400"}`}>
                  {label}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
              </div>
              {formData.category === value && (
                <Check size={16} className="ml-auto text-white shrink-0" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Step 2: Core Info ─────────────────────────────── */}
      <section className="bg-white/3 border border-white/10 rounded-2xl p-8 space-y-6">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-500">
          2 — Project Details
        </h2>

        {/* Title */}
        <div>
          <label className={labelClass}>Title *</label>
          <input
            required
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. The Last Light"
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell the story behind this project..."
            className={inputClass}
          />
        </div>

        {/* Role + Year */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Director, DoP, Editor..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Year</label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="2024"
              className={inputClass}
            />
          </div>
        </div>

        {/* Published Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            {formData.is_published ? (
              <Eye size={18} className="text-green-400" />
            ) : (
              <EyeOff size={18} className="text-gray-500" />
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {formData.is_published ? "Published" : "Draft"}
              </p>
              <p className="text-xs text-gray-500">
                {formData.is_published ? "Visible to the public" : "Only visible to you"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormData((p) => ({ ...p, is_published: !p.is_published }))}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              formData.is_published ? "bg-green-500" : "bg-white/20"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                formData.is_published ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>

      {/* ── Step 3: Media ─────────────────────────────────── */}
      <section className="bg-white/3 border border-white/10 rounded-2xl p-8 space-y-6">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-500">
          3 — Media
        </h2>

        {/* Cover Image Upload */}
        <div>
          <label className={labelClass}>
            <ImageIcon size={12} className="inline mr-2" />
            Cover Image
          </label>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver("cover"); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, "cover_image_url")}
            onClick={() => coverInputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[140px] ${
              dragOver === "cover"
                ? "border-white bg-white/10"
                : "border-white/20 hover:border-white/40 bg-white/3"
            }`}
          >
            {uploadingField === "cover_image_url" ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="animate-spin text-white" size={24} />
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">Uploading...</p>
              </div>
            ) : formData.cover_image_url ? (
              <div className="relative w-full">
                <img
                  src={formData.cover_image_url}
                  alt="Cover"
                  className="w-full max-h-52 object-contain bg-black/20 rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFormData((p) => ({ ...p, cover_image_url: "" })); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black rounded-lg text-white transition-colors"
                >
                  <X size={14} />
                </button>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                  <p className="text-white text-xs tracking-wider">Click to replace</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
                <Upload size={28} className="text-gray-500" />
                <p className="text-sm text-gray-400 font-light">Drop image here or <span className="text-white underline">browse</span></p>
                <p className="text-xs text-gray-600">PNG, JPG, WEBP — Max 50MB</p>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileInput(e, "cover_image_url")}
            />
          </div>

          {/* OR: paste URL */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-600">or paste URL</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <input
            type="url"
            name="cover_image_url"
            value={formData.cover_image_url}
            onChange={handleChange}
            placeholder="https://..."
            className={`${inputClass} mt-3`}
          />

          {/* Interactive Focal Point Picker — only shown when image is present */}
          {formData.cover_image_url && (
            <div className="mt-4">
              <label className={labelClass}>Focal Point — click or drag on the image</label>
              <div
                className="relative w-full overflow-hidden rounded-lg border border-white/10 cursor-crosshair mt-2"
                style={{ aspectRatio: "16/9" }}
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                  setFormData(p => ({ ...p, cover_position: `${x}% ${y}%` }));
                }}
                onMouseMove={(e) => {
                  if (e.buttons !== 1) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                  setFormData(p => ({ ...p, cover_position: `${x}% ${y}%` }));
                }}
              >
                {/* The image fills the box with the chosen focal point */}
                <img
                  src={formData.cover_image_url}
                  alt="Focal point preview"
                  className="w-full h-full object-cover pointer-events-none select-none"
                  style={{ objectPosition: formData.cover_position || "center" }}
                  draggable={false}
                />
                {/* Focal point dot */}
                {(() => {
                  const pos = formData.cover_position || "50% 50%";
                  const parts = pos.match(/(\d+)%\s*(\d+)%/);
                  if (!parts) return null;
                  return (
                    <div
                      className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ left: `${parts[1]}%`, top: `${parts[2]}%` }}
                    >
                      <div className="w-full h-full rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.8)] bg-white/30" />
                    </div>
                  );
                })()}
                {/* Hint overlay */}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded tracking-wider pointer-events-none">
                  DRAG TO SET FOCUS
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                The white dot shows where the image is anchored when cropped in the gallery.
              </p>
            </div>
          )}
        </div>

        {/* Video Upload OR URL */}
        <div className="pt-6 border-t border-white/10">
          <label className={labelClass}>
            <Video size={12} className="inline mr-2" />
            Project Video
          </label>
          
          <div className="space-y-4 mt-4">
            {/* Direct Upload */}
            <div>
              <p className="text-xs text-white mb-2">Option A: Upload Video File</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="video_file_url"
                  value={formData.video_file_url}
                  onChange={handleChange}
                  placeholder="https://... (or click upload)"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="shrink-0 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/30 transition-colors flex items-center gap-2"
                >
                  {uploadingField === "video_file_url" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Upload .mp4
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileInput(e, "video_file_url")}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-600">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Embed URL */}
            <div>
              <p className="text-xs text-white mb-2">Option B: Embed YouTube / Vimeo</p>
              <input
                type="text"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                className={inputClass}
              />
              <p className="text-xs text-gray-600 mt-2">Paste a standard Vimeo or YouTube link. It will automatically convert to a playable video.</p>
            </div>

            {/* Video Orientation — shown when any video is set */}
            {(formData.video_file_url || formData.video_url) && (
              <div className="pt-4 border-t border-white/10">
                <label className={labelClass}>Video Orientation</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {([
                    { value: "horizontal", label: "⬛ Horizontal", sub: "16:9  —  landscape" },
                    { value: "vertical",   label: "▬ Vertical",    sub: "9:16  —  portrait / reels" },
                  ] as const).map(({ value, label, sub }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, video_orientation: value }))}
                      className={`py-3 px-4 rounded-lg border text-left transition-all duration-200 ${
                        formData.video_orientation === value
                          ? "border-white bg-white text-black"
                          : "border-white/20 text-gray-400 hover:border-white/50"
                      }`}
                    >
                      <p className="text-sm font-semibold">{label}</p>
                      <p className={`text-xs mt-0.5 ${formData.video_orientation === value ? "text-black/60" : "text-gray-600"}`}>{sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Step 4: Gallery ─────────────────────────────────── */}
      <section className="bg-white/3 border border-white/10 rounded-2xl p-8 space-y-6">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-500">
          4 — Project Gallery
        </h2>
        <p className="text-xs text-gray-600 -mt-4">
          Upload multiple images to create a gallery for this project. Great for photography collections.
        </p>

        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-black/20">
                <img src={img.image_url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = [...galleryImages];
                      newImages.splice(idx, 1);
                      setGalleryImages(newImages);
                      if (img.id) setDeletedGalleryImages([...deletedGalleryImages, img.id]);
                    }}
                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5 transition-colors text-sm text-gray-400 hover:text-white"
          >
            {uploadingField === "gallery" ? (
              <>
                <Loader2 size={18} className="animate-spin text-white" />
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload size={18} />
                Add Gallery Images
              </>
            )}
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleGalleryUpload}
          />
        </div>
      </section>


      {/* ── Submit Bar ────────────────────────────────────── */}
      <div className="flex items-center justify-between py-4 sticky bottom-0 bg-[#050505] border-t border-white/10 px-2">
        <button
          type="button"
          onClick={() => { window.location.href = "/admin/projects"; }}
          className="text-sm text-gray-500 hover:text-white transition-colors tracking-wide"
        >
          ← Cancel
        </button>

        <button
          type="submit"
          disabled={loading || saved}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl font-semibold tracking-wide text-sm transition-all duration-300 ${
            saved
              ? "bg-green-500 text-white"
              : loading
              ? "bg-white/50 text-black"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          {saved ? (
            <><Check size={18} /> Saved!</>
          ) : loading ? (
            <><Loader2 size={18} className="animate-spin" /> Saving...</>
          ) : (
            <>{projectId ? "Save Changes" : "Create Project"} <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </form>
  );
}
