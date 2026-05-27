import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GridList02Item {
  id: string;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  fallbackText?: string;
  isActive?: boolean;
}

interface GridList02Props {
  items: GridList02Item[];
  onItemClick?: (id: string) => void;
  className?: string;
}

export function GridList02({ items, onItemClick, className }: GridList02Props) {
  return (
    <div className={cn("grid grid-cols-1 gap-3", className)}>
      {items.map((item) => (
        <Card
          key={item.id}
          onClick={() => onItemClick?.(item.id)}
          className={cn(
            "relative border transition-all duration-150 ease-out cursor-pointer hover:border-gray-400 hover:shadow-xs",
            item.isActive ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900/5" : "border-gray-200 bg-white"
          )}
        >
          <CardContent className="flex items-center space-x-3.5 p-3.5">
            <Avatar className="h-9 w-9 rounded-lg border border-gray-100 flex items-center justify-center shrink-0">
              <AvatarFallback className="rounded-lg bg-gray-100 text-gray-800 font-bold text-xs">
                {item.fallbackText || item.title.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 leading-normal">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-gray-900 truncate">
                  {item.title}
                </span>
                {item.badge && <div className="shrink-0">{item.badge}</div>}
              </div>
              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                {item.subtitle}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
