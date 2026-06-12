import ProjectForm from "@/components/ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-widest uppercase mb-8">Edit Project</h1>
      <ProjectForm projectId={resolvedParams.id} />
    </div>
  );
}
