import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/ProjectCard";

const MOCK_PROJECTS = [
  {
    id: "proj-1",
    title: "Neon Waveform",
    description: "An audio-reactive fragment shader experimenting with raymarching and neon glow effects.",
    lastModified: "2 hours ago",
    tags: ["Fragment", "Audio", "Raymarching"],
    thumbnailGradient: "from-cyan-500 via-blue-500 to-indigo-500",
  },
  {
    id: "proj-2",
    title: "Liquid Chrome",
    description: "Simulating metallic fluid dynamics using WebGL noise functions.",
    lastModified: "Yesterday",
    tags: ["Fluid", "Noise", "Material"],
    thumbnailGradient: "from-slate-400 via-zinc-500 to-neutral-700",
  },
  {
    id: "proj-3",
    title: "Cosmic Dust Particles",
    description: "A million-particle simulation of a rotating galaxy using compute shaders.",
    lastModified: "3 days ago",
    tags: ["Compute", "Particles", "Physics"],
    thumbnailGradient: "from-purple-600 via-fuchsia-500 to-pink-500",
  },
  {
    id: "proj-4",
    title: "Voxel Terrain Gen",
    description: "Infinite procedural terrain generation using 3D Perlin noise and marching cubes.",
    lastModified: "Last week",
    tags: ["Procedural", "Voxels", "Geometry"],
    thumbnailGradient: "from-emerald-400 via-green-500 to-teal-700",
  }
];


export function Dashboard() {
  const handleOpen = (id: string) => {
    console.log(`Navigating to /editor/${id}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-1 flex-col p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Shaders</h1>
          <p className="text-muted-foreground mt-2">
            Manage and edit your creative coding projects.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PROJECTS.map((project) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            title={project.title}
            description={project.description}
            lastModified={project.lastModified}
            tags={project.tags}
            thumbnailGradient={project.thumbnailGradient}
            onOpen={handleOpen}
          />
        ))}
      </div>
    </div>
  );
}