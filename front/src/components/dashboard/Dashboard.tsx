import { ProjectCard } from "@/components/dashboard/ProjectCard";

export function Dashboard() {
  const handleOpen = (id: string) => {
    console.log(`Navigating to /editor/${id}`);
  };

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard
        id="proj-1"
        title="Neon Waveform"
        description="An audio-reactive fragment shader experimenting with raymarching and neon glow effects."
        lastModified="2 hours ago"
        tags={["Fragment", "Audio", "Raymarching"]}
        thumbnailGradient="from-cyan-500 via-blue-500 to-indigo-500"
        onOpen={handleOpen}
      />

      <ProjectCard
        id="proj-2"
        title="Liquid Chrome"
        description="Simulating metallic fluid dynamics using WebGL noise functions."
        lastModified="Yesterday"
        tags={["Fluid", "Noise", "Material"]}
        thumbnailGradient="from-slate-400 via-zinc-500 to-neutral-700"
        onOpen={handleOpen}
      />
    </div>
  );
}
