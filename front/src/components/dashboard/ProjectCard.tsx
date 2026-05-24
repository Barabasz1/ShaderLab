import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  PencilIcon,
  TrashIcon,
} from "lucide-react";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  lastModified: string;
  thumbnailGradient: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function ProjectCard({
  id,
  title,
  description,
  lastModified,
  thumbnailGradient,
  onDelete,
}: ProjectCardProps & {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col pt-0">
      <div
        className={`h-40 w-full bg-linear-to-br ${thumbnailGradient} relative`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="absolute top-3 right-2 h-7 w-7">
            <Button variant="ghost" className="w-7 h-7">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() =>
                navigate({
                  to: `/$projectId/editProject`,
                  params: { projectId: id },
                })
              }
            >
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(id)}
            >
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="relative">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center border-t pt-6">
        <span className="text-sm text-muted-foreground">{lastModified}</span>
        <Link to="/$projectId/editor" params={{ projectId: id }}>
          <Button variant="default">
            <Pencil className="mr-2 h-4 w-4" />
            Open Editor
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
