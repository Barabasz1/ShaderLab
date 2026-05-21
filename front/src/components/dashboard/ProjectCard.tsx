import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Edit3 } from "lucide-react"; // Removed unused icons

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  lastModified: string;
  tags: string[];
  thumbnailGradient?: string;
  onOpen?: (id: string) => void;
}

export function ProjectCard({
  id,
  title,
  description,
  lastModified,
  tags,
  thumbnailGradient = "from-primary/40 via-primary/20 to-background",
  onOpen,
}: ProjectCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden pt-0 max-h-100">
      <div className="relative h-48 bg-muted">
        <div
          className={`absolute inset-0 bg-linear-to-br ${thumbnailGradient} opacity-70 over:opacity-100 transition-opacity duration-300`}
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-background/50 backdrop-blur-sm">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => onOpen?.(id)}
          >
            <Play className="h-6 w-6 ml-1" />
          </Button>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="mt-1">
          Modified {lastModified}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {description}
        </p>

        <div className="flex gap-2 mt-4 flex-wrap">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t mt-auto">
        <Button
          variant="default"
          className="w-full gap-2"
          onClick={() => onOpen?.(id)}
        >
          <Edit3 className="h-4 w-4" />
          Open in Editor
        </Button>
      </CardFooter>
    </Card>
  );
}
