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

const hospitalStats = [
  {
    name: "City General Hospital",
    patients: 1234,
    transfers_in: 95,
    transfers_out: 77,
    avg_stay: "5.2 days",
    occupancy: 87,
    satisfaction: 94,
    trend: "up",
  },
  {
    name: "County Medical Center",
    patients: 890,
    transfers_in: 63,
    transfers_out: 85,
    avg_stay: "4.8 days",
    occupancy: 78,
    satisfaction: 91,
    trend: "up",
  },
  {
    name: "Regional Health Facility",
    patients: 567,
    transfers_in: 50,
    transfers_out: 60,
    avg_stay: "6.1 days",
    occupancy: 72,
    satisfaction: 89,
    trend: "down",
  },
];

export const HospitalStatsTable = () => {
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
          {hospitalStats.map((hospital) => (
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
