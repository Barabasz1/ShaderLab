import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CATALOG, CAT } from "@/lib/constants";
import { CategoryBadge } from "../ui/CategoryBadge";

export function LeftSidebar() {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const q = query.toLowerCase().trim();

  return (
    <Sidebar>
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2 font-semibold text-[13px]">
          <span className="text-blue-600">⬡</span> Nodes
        </div>
      </SidebarHeader>

      <div className="px-3 pb-2">
        <Input
          placeholder="Search nodes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 text-xs bg-muted"
        />
      </div>
      <Separator />

      <SidebarContent>
        {CATALOG.map(({ cat, items }) => {
          const filtered = items.filter(
            (i) =>
              !q || i.label.toLowerCase().includes(q) || i.type.includes(q),
          );
          if (!filtered.length) return null;
          const isOpen = !collapsed[cat];

          return (
            <SidebarGroup key={cat}>
              <SidebarGroupLabel
                onClick={() => setCollapsed((c) => ({ ...c, [cat]: isOpen }))}
                className="cursor-pointer hover:bg-muted"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mr-2"
                  style={{ background: CAT[cat].color }}
                />
                {cat} ({filtered.length})
              </SidebarGroupLabel>
              {isOpen && (
                <SidebarMenu>
                  {filtered.map((item) => (
                    <SidebarMenuItem key={item.type}>
                      <SidebarMenuButton
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/nodeflow",
                            JSON.stringify(item),
                          );
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className="h-auto p-1.5 cursor-grab active:cursor-grabbing"
                      >
                        <span
                          className="flex items-center justify-center w-6 h-6 rounded text-[11px] text-white shrink-0"
                          style={{ background: CAT[cat].color }}
                        >
                          {item.icon}
                        </span>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium mr-auto">
                              {item.label}
                            </span>
                            {item.outputs.length > 0 && (
                              <CategoryBadge category={cat}>
                                {item.outputs.length}out
                              </CategoryBadge>
                            )}
                          </div>
                          {item.inputs.length > 0 && (
                            <span className="text-[10px] text-muted-foreground truncate font-mono">
                              ({item.inputs.join(", ")})
                            </span>
                          )}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="text-[11px] text-muted-foreground border-t p-3">
        Drag nodes onto the canvas ↗
      </SidebarFooter>
    </Sidebar>
  );
}
