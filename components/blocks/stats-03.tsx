import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Stats03Item {
  name: string;
  stat: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

interface Stats03Props {
  items: Stats03Item[];
  className?: string;
}

export function Stats03({ items, className }: Stats03Props) {
  return (
    <dl className={cn("grid grid-cols-2 gap-4 sm:grid-cols-4 w-full", className)}>
      {items.map((item) => (
        <Card key={item.name} className="p-4 shadow-2xs border-gray-200">
          <CardContent className="p-0 leading-normal">
            <dt className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{item.name}</dt>
            <dd className="mt-1.5 flex items-baseline space-x-2">
              <span className="text-xl font-bold text-gray-900 leading-tight tracking-tight">
                {item.stat}
              </span>
              {item.change && (
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    item.changeType === "positive" && "text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded",
                    item.changeType === "negative" && "text-red-600 bg-red-50 px-1.5 py-0.5 rounded",
                    item.changeType === "neutral" && "text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded"
                  )}
                >
                  {item.change}
                </span>
              )}
            </dd>
          </CardContent>
        </Card>
      ))}
    </dl>
  );
}
