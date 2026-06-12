import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

// Dynamic Metadata for SEO and Social Sharing
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: project } = await supabase
    .from("projects")
    .select("title, description, meta_title, meta_description, og_image_url, cover_image_url")
    .eq("id", resolvedParams.id)
    .single();

  if (!project) return { title: "Project Not Found" };

  const title = project.meta_title || `${project.title} | Omar Shady`;
  const description = project.meta_description || project.description || "A cinematic project by Omar Shady.";
  const image = project.og_image_url || project.cover_image_url || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!project) return notFound();

  // Fetch optional gallery images
  const { data: gallery } = await supabase
    .from("project_images")
    .select("image_url")
    .eq("project_id", resolvedParams.id)
    .order("display_order", { ascending: true });

  return (
    <div className="pt-32 px-6 max-w-5xl mx-auto w-full min-h-screen pb-24">
      <div className="mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-4">
          {project.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm tracking-wider text-gray-400 uppercase">
          {project.role && <span>Role: {project.role}</span>}
          {project.year && <span>Year: {project.year}</span>}
        </div>
      </div>

      {/* Main Media (Video or Image) */}
      <div className="w-full mb-16 animate-fade-in-up animation-delay-200">
        {project.video_url ? (
          <div className="relative aspect-video w-full overflow-hidden bg-[#111]">
            <iframe
              src={project.video_url}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          project.cover_image_url && (
            <div className="relative w-full overflow-hidden">
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )
        )}
      </div>

      {/* Description */}
      {project.description && (
        <div className="prose prose-invert max-w-none text-lg font-light leading-relaxed mb-16 animate-fade-in-up animation-delay-400">
          <p>{project.description}</p>
        </div>
      )}

      {/* Gallery */}
      {gallery && gallery.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up animation-delay-400">
          {gallery.map((img, idx) => (
            <img
              key={idx}
              src={img.image_url}
              alt={`${project.title} Gallery Image ${idx + 1}`}
              className="w-full h-auto object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
