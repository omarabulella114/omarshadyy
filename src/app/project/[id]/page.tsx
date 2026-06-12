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

function getEmbedUrl(url: string) {
  if (!url) return "";
  
  // YouTube matching: watch?v=ID or youtu.be/ID
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
  }
  
  // Vimeo matching: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=0`;
  }

  // Fallback to exactly what the user pasted if it doesn't match
  return url;
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

  const embedUrl = project.video_url ? getEmbedUrl(project.video_url) : "";

  return (
    <div className="min-h-screen pb-24">
      <div className="pt-32 px-6 max-w-5xl mx-auto w-full">
        <div className="mb-8 md:mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-4 text-black">
            {project.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm tracking-wider text-gray-500 uppercase">
            {project.role && <span>Role: {project.role}</span>}
            {project.year && <span>Year: {project.year}</span>}
          </div>
        </div>
      </div>

      {/* Main Media (Video or Image) - Full Bleed */}
      <div className="w-full mb-16 animate-fade-in-up animation-delay-200">
        {embedUrl ? (
          <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          project.cover_image_url && (
            <div className="relative w-full overflow-hidden bg-black/5">
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )
        )}
      </div>

      <div className="px-6 max-w-5xl mx-auto w-full">
        {/* Description */}
        {project.description && (
          <div className="prose max-w-none text-lg font-light leading-relaxed mb-16 animate-fade-in-up animation-delay-400 text-gray-700">
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
                className="w-full h-auto object-cover bg-black/5"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
