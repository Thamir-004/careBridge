import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface HospitalStatsTableProps {
  data: any[];
}

export const HospitalStatsTable = ({ data }: HospitalStatsTableProps) => {
  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hospital</TableHead>
            <TableHead className="text-right">Patients</TableHead>
            <TableHead className="text-right">Transfers In</TableHead>
            <TableHead className="text-right">Transfers Out</TableHead>
            <TableHead className="text-right">Avg Stay</TableHead>
            <TableHead className="text-right">Occupancy</TableHead>
            <TableHead className="text-right">Satisfaction</TableHead>
            <TableHead className="text-center">Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((hospital) => (
            <TableRow key={hospital.name}>
              <TableCell className="font-medium">{hospital.name}</TableCell>
              <TableCell className="text-right">
                <Badge variant="outline">{hospital.patients}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary" className="badge-transferred">
                  {hospital.transfers_in}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary">{hospital.transfers_out}</Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {hospital.avg_stay}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm">{hospital.occupancy}%</span>
                  <div className="h-2 w-16 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${hospital.occupancy}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline" className="badge-active">
                  {hospital.satisfaction}%
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {hospital.trend === "up" ? (
                  <TrendingUp className="mx-auto h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="mx-auto h-4 w-4 text-destructive" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
