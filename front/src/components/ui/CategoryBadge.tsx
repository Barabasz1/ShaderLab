import { Badge } from "@/components/ui/badge";
import { CAT } from "@/lib/constants";

interface CategoryBadgeProps {
  category: string;
  children: React.ReactNode;
}

export function CategoryBadge({ category, children }: CategoryBadgeProps) {
  const catStyle = CAT[category] ?? CAT.Utility;

  return (
    <Badge
      variant="outline"
      className="text-[9px] px-1 h-4"
      style={{
        backgroundColor: catStyle.bg,
        color: catStyle.color,
        borderColor: `${catStyle.color}44`,
      }}
    >
      {children}
    </Badge>
  );
}