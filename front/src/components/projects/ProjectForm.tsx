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
import { Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface ProjectFormProps {
  defaultTitle?: string;
  defaultDescription?: string;
  heading: string;
  subheading: string;
  submitLabel: string;
  onSubmit: (title: string, description: string) => Promise<void>;
  cancelHref: string;
}

export function ProjectForm({
  defaultTitle = "",
  defaultDescription = "",
  heading,
  subheading,
  submitLabel,
  onSubmit,
  cancelHref,
}: ProjectFormProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(title, description);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col p-8 h-[calc(100vh-2.75rem)] overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
        <p className="text-muted-foreground mt-2">{subheading}</p>
      </div>
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
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6 mt-2 bg-muted/20">
            <Link to={cancelHref}>
              <Button variant="ghost">Cancel </Button>
            </Link>

            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {submitLabel}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
