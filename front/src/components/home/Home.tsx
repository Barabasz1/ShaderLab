import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Network, Zap, Share2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function HomeScreen() {
    return (
      <div className="h-[calc(100vh-2.75rem)] w-full overflow-y-auto snap-y snap-mandatory scroll-smooth bg-background">
        <section className="relative w-full min-h-[calc(100vh-2.75rem)] snap-start flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              Build shaders with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                node-based logic.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A real-time, visual programming environment for WebGL and compute
              shaders. Connect nodes, compile instantly, and create stunning
              visual effects right in your browser.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild className="gap-2">
                <Link to="/createProject">
                  Start Coding <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="absolute bottom-8 animate-bounce text-muted-foreground">
            <ChevronDown className="h-6 w-6" />
          </div>
        </section>

        <section className="relative w-full min-h-[calc(100vh-2.75rem)] snap-start flex flex-col justify-between pt-20">
          <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 w-full">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                Everything you need to create
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful tools designed for creative coders and technical
                artists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-muted/50 border-none">
                <CardHeader>
                  <Network className="h-10 w-10 text-blue-500 mb-2" />
                  <CardTitle>Visual Node Graph</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Construct complex materials and fragment shaders without
                    writing a single line of GLSL. Connect math, noise, and
                    color nodes visually.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-muted/50 border-none">
                <CardHeader>
                  <Zap className="h-10 w-10 text-cyan-500 mb-2" />
                  <CardTitle>Real-time Compilation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    See your changes instantly. Our engine compiles your node
                    graph into optimized shader code on the fly at 60 FPS.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-muted/50 border-none">
                <CardHeader>
                  <Share2 className="h-10 w-10 text-indigo-500 mb-2" />
                  <CardTitle>Cloud Sync & Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Save your workspaces securely to your account. Export your
                    shaders to integrate directly into React Three Fiber or
                    Three.js.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
}