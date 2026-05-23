import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  lastModified: string;
  thumbnailGradient: string;
  onOpen: (id: string) => void;
}

export function ProjectCard({
  id,
  title,
  description,
  lastModified,
  thumbnailGradient,
  onOpen,
}: ProjectCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden pt-0">
      <div className={`h-40 w-full bg-gradient-to-br ${thumbnailGradient}`} />

      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardFooter className="flex justify-between items-center border-t pt-6">
        <span className="text-sm text-muted-foreground">
          {lastModified}
        </span>
        <Button variant="default" onClick={() => onOpen(id)}>
          <Pencil className="mr-2 h-4 w-4" />
          Open Editor
        </Button>
      </CardFooter>
    </Card>
  );
}

