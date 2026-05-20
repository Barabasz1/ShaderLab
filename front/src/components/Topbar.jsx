import { GitBranch, Play, Save, Undo2, Redo2 } from "lucide-react";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";

function IconBtn({ children, label, variant = "ghost" }) {
  return (
    <button
      title={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded text-muted-foreground",
        "hover:bg-muted hover:text-foreground transition-colors",
        variant === "primary" &&
          "bg-brand-500 text-white hover:bg-brand-600 hover:text-white w-auto px-3 gap-1.5",
      )}
    >
      {children}
      {variant === "primary" && (
        <span className="text-xs font-medium">Run</span>
      )}
    </button>
  );
}

export function Topbar() {
  return (
    <header className="flex h-10 shrink-0 items-center border-b border-border bg-panel px-3 gap-2">
      <div className="flex items-center gap-1.5 mr-3">
        <GitBranch size={15} className="text-brand-500" />
        <span className="text-sm font-semibold tracking-tight">NodeFlow</span>
      </div>

      <Separator orientation="vertical" className="h-5" />

      <div className="flex items-center gap-0.5">
        <IconBtn label="Undo">
          <Undo2 size={14} />
        </IconBtn>
        <IconBtn label="Redo">
          <Redo2 size={14} />
        </IconBtn>
      </div>

      <Separator orientation="vertical" className="h-5" />

      <IconBtn label="Save">
        <Save size={14} />
      </IconBtn>

      <div className="ml-auto">
        <IconBtn variant="primary" label="Run">
          <Play size={12} />
        </IconBtn>
      </div>
    </header>
  );
}
