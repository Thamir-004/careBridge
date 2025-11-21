import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface TopTransferredPatientsTableProps {
  data: any[];
}

export const TopTransferredPatientsTable = ({ data }: TopTransferredPatientsTableProps) => {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Patient ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Transfers</TableHead>
            <TableHead>Current Hospital</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((patient, index) => (
            <TableRow key={patient.name}>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  #{index + 1}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">PAT-{index + 1}</TableCell>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{patient.transfers}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                Last Hospital
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
