import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Table01Column {
  key: string;
  header: string;
  className?: string;
  align?: "left" | "center" | "right";
}

interface Table01Props {
  columns: Table01Column[];
  data: any[];
  className?: string;
  renderCell?: (row: any, key: string, index: number) => React.ReactNode;
}

export function Table01({ columns, data, className, renderCell }: Table01Props) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 border-b border-gray-200">
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "h-10 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider select-none",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-xs text-gray-500 font-medium"
                >
                  ไม่มีข้อมูลแสดงรายการ
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow
                  key={row.id || rowIndex}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-xs text-gray-900 leading-normal",
                        col.align === "right" && "text-right font-mono",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {renderCell
                        ? renderCell(row, col.key, rowIndex)
                        : row[col.key] !== undefined
                        ? String(row[col.key])
                        : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
