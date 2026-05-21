import { Badge } from "@/components/ui/badge";
import { NodeCategory } from "@/nodes/nodeDefs";

interface CategoryBadgeProps {
  category: NodeCategory;
  children: React.ReactNode;
}

export function CategoryBadge({ category, children }: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="text-[9px] px-1 h-4"
      style={{
        backgroundColor: category.bg,
        color: category.color,
        borderColor: `${category.color}44`,
      }}
    >
      {children}
    </Badge>
  );
}
