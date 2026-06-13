"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    hero_media_url: "",
    hero_media_type: "image",
    bio_text: "",
    about_image_url: "",
    about_subtitle: "",
    about_title: "",
    about_text: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const { data } = await supabase.from("site_settings").select("*").limit(1).single();
    if (data) {
      setSettingsId(data.id);
      setFormData({
        hero_media_url: data.hero_media_url || "",
        hero_media_type: data.hero_media_type || "image",
        bio_text: data.bio_text || "",
        about_image_url: data.about_image_url || "",
        about_subtitle: data.about_subtitle || "",
        about_title: data.about_title || "",
        about_text: data.about_text || "",
      });
    }
    setInitialLoad(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setLoading(true);
    const { error: uploadError } = await supabase.storage
      .from('portfolio-media')
      .upload(filePath, file);

    if (!uploadError) {
      const { data } = supabase.storage.from('portfolio-media').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, [field]: data.publicUrl }));
    } else {
      alert("Error uploading file: " + uploadError.message);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (settingsId) {
      await supabase.from("site_settings").update(formData).eq("id", settingsId);
    } else {
      await supabase.from("site_settings").insert([formData]);
    }

    setLoading(false);
    alert("Settings saved successfully!");
  };

  if (initialLoad) return <div className="text-gray-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-widest uppercase mb-8">Homepage Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-8 bg-[#0a0a0a] p-8 border border-white/10 rounded-xl">
        
        {/* Bio Text */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Short Bio (Displayed on Homepage)</label>
          <textarea 
            name="bio_text" 
            rows={3} 
            value={formData.bio_text} 
            onChange={handleChange} 
            className="w-full bg-white/5 border border-white/10 rounded p-3 text-white" 
          />
        </div>

        {/* Hero Media */}
        <div className="border-t border-white/10 pt-6 mt-2">
          <h3 className="text-lg font-medium mb-4">Hero Background</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Media Type</label>
              <select name="hero_media_type" value={formData.hero_media_type} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded p-3 text-white">
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Media URL (or upload)</label>
              <div className="flex flex-col gap-2">
                <input type="text" name="hero_media_url" value={formData.hero_media_url} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-3 text-white" />
                <input type="file" accept={formData.hero_media_type === "video" ? "video/*" : "image/*"} onChange={(e) => uploadFile(e, 'hero_media_url')} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white" />
              </div>
            </div>
          </div>
          
          {formData.hero_media_url && formData.hero_media_type === "image" && (
            <img src={formData.hero_media_url} alt="Hero Preview" className="h-48 object-cover mt-6 rounded border border-white/10" />
          )}
          {formData.hero_media_url && formData.hero_media_type === "video" && (
            <video src={formData.hero_media_url} autoPlay loop muted className="h-48 object-cover mt-6 rounded border border-white/10" />
          )}
        </div>

        {/* About Page Portrait */}
        <div className="border-t border-white/10 pt-6 mt-2">
          <h3 className="text-lg font-medium mb-4">About Page Portrait</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Image URL (or upload)</label>
              <div className="flex flex-col gap-2">
                <input type="text" name="about_image_url" value={formData.about_image_url} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-3 text-white" placeholder="https://..." />
                <input type="file" accept="image/*" onChange={(e) => uploadFile(e, 'about_image_url')} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white" />
              </div>
            </div>
          </div>
          
          {formData.about_image_url && (
            <img src={formData.about_image_url} alt="About Portrait Preview" className="h-48 object-cover mt-6 rounded border border-white/10" />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
              <input type="text" name="about_subtitle" value={formData.about_subtitle} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-3 text-white" placeholder="Director & Photographer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input type="text" name="about_title" value={formData.about_title} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-3 text-white" placeholder="Vision & Philosophy" />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Biography Text (Use Enter for new paragraphs)</label>
            <textarea name="about_text" value={formData.about_text} onChange={handleChange} rows={6} className="w-full bg-white/5 border border-white/10 rounded p-3 text-white" placeholder="I am Omar Shady..." />
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black px-8 py-3 rounded font-semibold tracking-wide uppercase hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
