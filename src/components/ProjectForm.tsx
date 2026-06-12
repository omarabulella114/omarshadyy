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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "film" as "film" | "creative",
    role: "",
    year: new Date().getFullYear().toString(),
    video_url: "",
    cover_image_url: "",
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
        cover_image_url: data.cover_image_url || "",
        is_published: data.is_published || false,
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        og_image_url: data.og_image_url || "",
      });
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
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    setUploadingField(field);
    setUploadProgress(10);

    const { error: uploadError } = await supabase.storage
      .from("portfolio-media")
      .upload(fileName, file, { upsert: false });

    setUploadProgress(80);

    if (!uploadError) {
      const { data } = supabase.storage.from("portfolio-media").getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, [field]: data.publicUrl }));
      setUploadProgress(100);
    } else {
      alert("Upload failed: " + uploadError.message);
    }

    setTimeout(() => {
      setUploadingField(null);
      setUploadProgress(0);
    }, 600);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files?.[0]) return;
    await uploadFile(e.target.files[0], field);
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
    if (projectId) {
      const { error } = await supabase.from("projects").update(formData).eq("id", projectId);
      submitError = error;
    } else {
      const { error } = await supabase.from("projects").insert([formData]);
      submitError = error;
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
                  className="w-full max-h-52 object-cover rounded-lg"
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
        </div>

        {/* Video URL */}
        <div>
          <label className={labelClass}>
            <Video size={12} className="inline mr-2" />
            Video URL
          </label>
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
      </section>

      {/* ── Step 4: SEO (Collapsible) ─────────────────────── */}
      <section className="bg-white/3 border border-white/10 rounded-2xl p-8 space-y-6">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-500 flex items-center gap-2">
          <Globe size={12} />
          4 — SEO & Sharing
          <span className="text-gray-700 font-normal normal-case tracking-normal text-xs">(optional)</span>
        </h2>

        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className={labelClass}>Meta Title</label>
            <input
              type="text"
              name="meta_title"
              value={formData.meta_title}
              onChange={handleChange}
              placeholder={formData.title || "Appears in browser tab and Google results"}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Meta Description</label>
            <textarea
              name="meta_description"
              rows={2}
              value={formData.meta_description}
              onChange={handleChange}
              placeholder="A short summary shown in Google search results..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>OG Image (WhatsApp / Facebook Preview)</label>
            <div className="flex gap-3">
              <input
                type="text"
                name="og_image_url"
                value={formData.og_image_url}
                onChange={handleChange}
                placeholder="https://... (defaults to cover image if empty)"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => ogInputRef.current?.click()}
                className="shrink-0 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/30 transition-colors flex items-center gap-2"
              >
                {uploadingField === "og_image_url" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                Upload
              </button>
              <input
                ref={ogInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileInput(e, "og_image_url")}
              />
            </div>
          </div>
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
