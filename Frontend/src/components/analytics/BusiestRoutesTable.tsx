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

const routes = [
  { from: "City General", to: "County Medical", transfers: 45, percentage: 100 },
  { from: "County Medical", to: "City General", transfers: 38, percentage: 84 },
  { from: "City General", to: "Regional Health", transfers: 32, percentage: 71 },
  { from: "Regional Health", to: "City General", transfers: 28, percentage: 62 },
  { from: "County Medical", to: "Regional Health", transfers: 25, percentage: 56 },
  { from: "Regional Health", to: "County Medical", transfers: 22, percentage: 49 },
];

export const BusiestRoutesTable = () => {
  return (
    <div className="space-y-4">
      {routes.map((route, index) => (
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
