import { ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface TopbarProps {
  children?: ReactNode;
}

export function Topbar({ children }: TopbarProps) {
  const navLinkClass = buttonVariants({
    variant: "ghost",
    size: "sm",
    className: "h-7 px-2 text-xs"
  });

  return (
    <div className="h-11 shrink-0 flex items-center gap-2 px-3 border-b bg-background">
      <Link to="/" className="flex items-center">
        <span className="text-brand text-base">⬡</span>
        <span className="text-[13px] font-semibold mr-2">ShaderLab</span>
      </Link>

      <Separator orientation="vertical" className="h-6" />

      <Link to="/" className={navLinkClass}>
        Home
      </Link>
      <Link to="/dashboard" className={navLinkClass}>
        Dashboard
      </Link>
      <Link to="/editor" className={navLinkClass}>
        Editor
      </Link>
      <Link to="/profile" className={navLinkClass}>
        Profile
      </Link>


      <Separator orientation="vertical" className="h-6" />

      <div className="ml-auto flex items-center gap-2">
        {children}

        <ThemeToggle />
      </div>
    </div>
  );
}