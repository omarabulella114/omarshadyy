import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700"] });

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

  // Fetch all videos for this project
  const { data: projectVideos } = await supabase
    .from("project_videos")
    .select("*")
    .eq("project_id", resolvedParams.id)
    .order("display_order", { ascending: true });

  const embedUrl = project.video_url ? getEmbedUrl(project.video_url) : "";

  // Build final video list: prefer project_videos table, fall back to legacy single video fields
  const videoList = (projectVideos && projectVideos.length > 0)
    ? projectVideos
    : (project.video_file_url || project.video_url)
      ? [{ id: "legacy", title: "", video_file_url: project.video_file_url || "", video_url: project.video_url || "", video_orientation: project.video_orientation || "horizontal" }]
      : [];

  // Fetch sibling projects for Prev/Next nav
  const { data: categoryProjects } = await supabase
    .from("projects")
    .select("id, title")
    .eq("category", project.category)
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  let prevProject = null;
  let nextProject = null;

  if (categoryProjects) {
    const currentIndex = categoryProjects.findIndex((p) => p.id === project.id);
    if (currentIndex > 0) prevProject = categoryProjects[currentIndex - 1];
    if (currentIndex !== -1 && currentIndex < categoryProjects.length - 1) nextProject = categoryProjects[currentIndex + 1];
  }

  const backHref = project.category === "film" ? "/films" : "/creative-projects";
  const backLabel = project.category === "film" ? "Films" : "Creative Projects";

  return (
    <div className="pt-32 px-6 max-w-5xl mx-auto w-full min-h-screen pb-24">

      {/* Back Button */}
      <div className="mb-8 animate-fade-in-up">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-gray-400 hover:text-black transition-colors duration-300 group"
        >
          <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
          {backLabel}
        </Link>
      </div>

      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-2xl md:text-4xl font-semibold tracking-wide mb-3 text-black leading-tight">
          {project.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-xs tracking-wider text-gray-400 uppercase">
          {project.role && <span>{project.role}</span>}
          {project.year && <span>{project.year}</span>}
        </div>
      </div>

      {/* Videos Grid */}
      {videoList.length > 0 && (
        <div className={`w-full mb-16 animate-fade-in-up animation-delay-200 ${
          videoList.length === 1 ? "" : "grid grid-cols-1 md:grid-cols-2 gap-6"
        }`}>
          {videoList.map((vid: any, idx: number) => {
            const embed = vid.video_url ? getEmbedUrl(vid.video_url) : "";
            const parseRatio = (r: string) => {
              if (r === "horizontal") return 56.25;  // 16:9
              if (r === "vertical")   return 177.78; // 9:16
              const [w, h] = (r || "16:9").split(":").map(Number);
              return (w && h) ? (h / w) * 100 : 56.25;
            };
            const paddingPct = `${parseRatio(vid.video_orientation)}%`;
            const isPortrait = vid.video_orientation === "9:16" || vid.video_orientation === "vertical";
            return (
              <div key={vid.id || idx} className="space-y-3">
                {vid.title && (
                  <p className={`text-sm font-medium tracking-wider text-black/70 ${playfair.className}`}>{vid.title}</p>
                )}
                {/* Vertical: fixed height container, horizontal: padding-bottom ratio trick */}
                {isPortrait ? (
                  <div className="flex justify-center">
                    <div className="relative overflow-hidden bg-black/5" style={{ height: "min(85vh, 600px)", aspectRatio: "9/16" }}>
                      {vid.video_file_url ? (
                        <video
                          src={vid.video_file_url}
                          controls
                          playsInline
                          preload="none"
                          poster={project.cover_image_url || undefined}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      ) : embed ? (
                        <iframe src={embed} className="absolute inset-0 w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div
                    className="relative w-full overflow-hidden bg-black/5"
                    style={{ paddingBottom: paddingPct }}
                  >
                    {vid.video_file_url ? (
                      <video
                        src={vid.video_file_url}
                        controls
                        playsInline
                        preload="none"
                        poster={project.cover_image_url || undefined}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    ) : embed ? (
                      <iframe src={embed} className="absolute inset-0 w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fallback: cover image if no videos */}
      {videoList.length === 0 && project.cover_image_url && (
        <div className="relative w-full overflow-hidden bg-black/5 mb-16">
          <img src={project.cover_image_url} alt={project.title} className="w-full h-auto object-cover" />
        </div>
      )}

      {/* Description */}
      {project.description && (
        <div className="max-w-2xl mb-16 animate-fade-in-up animation-delay-400 space-y-4">
          {project.description.split("\n").filter((l: string) => l.trim() !== "").map((line: string, idx: number) => {
            if (line.startsWith("## ")) {
              return (
                <h3 key={idx} className={`text-base md:text-lg font-semibold tracking-wider text-black mt-6 ${playfair.className}`}>
                  {line.replace("## ", "")}
                </h3>
              );
            }
            if (line.startsWith("# ")) {
              return (
                <h2 key={idx} className={`text-xl md:text-2xl font-bold tracking-wide text-black mt-8 ${playfair.className}`}>
                  {line.replace("# ", "")}
                </h2>
              );
            }
            return (
              <p key={idx} className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                {line}
              </p>
            );
          })}
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

      {/* Next/Prev Navigation */}
      <div className="flex justify-between items-center mt-32 pt-10 border-t border-gray-200 animate-fade-in-up animation-delay-500">
        <div className="flex-1">
          {prevProject && (
            <Link href={`/project/${prevProject.id}`} className="group inline-block">
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-2 group-hover:text-black transition-colors">← Previous</p>
              <p className="text-lg md:text-xl font-bold uppercase text-black group-hover:opacity-60 transition-opacity">{prevProject.title}</p>
            </Link>
          )}
        </div>
        
        <div className="flex-1 text-right">
          {nextProject && (
            <Link href={`/project/${nextProject.id}`} className="group inline-block text-right">
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-2 group-hover:text-black transition-colors">Next →</p>
              <p className="text-lg md:text-xl font-bold uppercase text-black group-hover:opacity-60 transition-opacity">{nextProject.title}</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
