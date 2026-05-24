import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { Globe, Lock } from "lucide-react";
import { Switch } from "../ui/switch";

interface ProjectFormProps {
  defaultTitle?: string;
  defaultDescription?: string;
  defaultIsPublic?: boolean; 
  submitLabel: string;
  onSubmit: (
    title: string,
    description: string,
    isPublic: boolean,
  ) => Promise<void>;
  cancelHref: string;
}

export function ProjectForm({
  defaultTitle = "",
  defaultDescription = "",
  defaultIsPublic = false,
  submitLabel,
  onSubmit,
  cancelHref,
}: ProjectFormProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [isPublic, setIsPublic] = useState(defaultIsPublic);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(title, description, isPublic);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Name and describe your creation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="e.g., Neon Waveform"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="What are you trying to build?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {isPublic ? "Public" : "Private"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPublic
                      ? "Anyone can view this project."
                      : "Only you can see this project."}
                  </p>
                </div>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6 mt-2 bg-muted/20">
          <Link to={cancelHref}>
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" disabled={!title.trim() || isSubmitting}>
            {submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
