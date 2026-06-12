import ProjectForm from "@/components/ProjectForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewProjectPage() {
  return (
    <div className="max-w-4xl mx-auto pb-32">
      <div className="mb-10">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors tracking-widest uppercase mb-6"
        >
          <ChevronLeft size={14} /> Back to Projects
        </Link>
        <h1 className="text-3xl font-bold tracking-widest uppercase">New Project</h1>
        <p className="text-gray-500 text-sm mt-2 font-light">Fill in the details below to add a new project to your portfolio.</p>
      </div>
      <ProjectForm />
    </div>
  );
}
