import React, { useState } from "react";
import { ArrowLeft, Box, Image as ImageIcon, Cpu, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


export function CreateProjectScreen() {
  const [title, setTitle] = useState("Untitled Shader");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("blank");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating project:", { title, description, selectedTemplate });
    // Add your API creation logic and redirect to /editor/:id here
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col p-8 h-[calc(100vh-2.75rem)] overflow-y-auto">

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new shader experiment and choose a starting point.
        </p>
      </div>

      <form onSubmit={handleCreate}>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Name and describe your new creation.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Standard Inputs */}
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
            <Button variant="ghost" asChild>
              <Link to="/dashboard">Cancel</Link>
            </Button>

            <Button type="submit" disabled={!title.trim()}>
              Create Project
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}