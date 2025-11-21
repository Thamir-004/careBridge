import { ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BusiestRoutesTableProps {
  data: any[];
}

export const BusiestRoutesTable = ({ data }: BusiestRoutesTableProps) => {
  return (
    <div className="space-y-4">
      {data.map((route, index) => (
        <div
          key={`${route.from}-${route.to}`}
          className="rounded-lg border border-border bg-card p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                #{index + 1}
              </Badge>
              <span className="text-sm font-medium">{route.from}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{route.to}</span>
            </div>
            <Badge variant="secondary">{route.transfers} transfers</Badge>
          </div>
          <Progress value={route.percentage} className="h-2" />
        </div>
      ))}
    </div>
  );
};
