import { useMemo, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { nodeDefs, NodeCategories, portTypeLabel } from "@/nodes/nodeDefs";
import type { NodeDef, PortDef, PortType } from "@/nodes/nodeDefs";

import { CategoryBadge } from "../ui/CategoryBadge";

type SidebarNodeItem = NodeDef & {
  type: string;
};

const portSummary = (ports: PortDef[]) => {
  const counts = ports.reduce<Record<PortType, number>>(
    (acc, port) => ({
      ...acc,
      [port.type]: (acc[port.type] ?? 0) + 1,
    }),
    {} as Record<PortType, number>,
  );

  return Object.entries(counts)
    .map(([type, count]) =>
      count > 1 ? `${portTypeLabel(type as PortType)} ×${count}` : portTypeLabel(type as PortType),
    )
    .join(", ");
};

export function LeftSidebar() {
  const [query, setQuery] = useState("");

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const q = query.toLowerCase().trim();

  const grouped = useMemo(() => {
    const groups: Record<string, SidebarNodeItem[]> = {};

    Object.entries(nodeDefs).forEach(([type, def]) => {
      if (!def.category) return;

      if (
        q &&
        !def.label.toLowerCase().includes(q) &&
        !type.toLowerCase().includes(q)
      ) {
        return;
      }

      const cat = def.category.label;

      if (!groups[cat]) {
        groups[cat] = [];
      }

      groups[cat].push({
        ...def,
        type,
      });
    });

    return groups;
  }, [q]);

  return (
    <Sidebar
      className="top-11 h-[calc(100svh-var(--header-height))]!"
    >
      <div className="px-3 py-2">
        <Input
          placeholder="Search nodes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 text-xs bg-muted"
        />
      </div>

      <Separator />

      <SidebarContent>
        {Object.entries(grouped).map(([catLabel, items]) => {
          const category = items[0]?.category ?? NodeCategories.INPUT;

          const isOpen = !collapsed[catLabel];

          return (
            <SidebarGroup key={catLabel}>
              <SidebarGroupLabel
                onClick={() =>
                  setCollapsed((c) => ({
                    ...c,
                    [catLabel]: isOpen,
                  }))
                }
                className="cursor-pointer hover:bg-muted"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mr-2"
                  style={{
                    background: category.color,
                  }}
                />
                {catLabel} ({items.length})
              </SidebarGroupLabel>

              {isOpen && (
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.type}>
                      <SidebarMenuButton
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/nodeflow",
                            JSON.stringify({
                              type: item.type,
                            }),
                          );

                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className="h-auto p-1.5 cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium mr-auto">
                              {item.label}
                            </span>

                            {item.outputs.length > 0 && (
                              <CategoryBadge category={category}>
                                {portSummary(item.outputs)}
                              </CategoryBadge>
                            )}
                          </div>

                          {item.inputs.length > 0 && (
                            <span className="text-[10px] text-muted-foreground truncate font-mono">
                              (
                              {item.inputs
                                .map((p) => portTypeLabel(p.type))
                                .join(", ")}
                              )
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
