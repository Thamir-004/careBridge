import { ArrowLeftRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transfer {
  id: string;
  patientName: string;
  patientId: string;
  fromHospital: string;
  toHospital: string;
  date: string;
  time: string;
  reason: string;
  status: "completed" | "pending" | "cancelled";
  transferredBy: string;
}

interface TransferTableProps {
  transfers: Transfer[];
  onViewDetails: (transferId: string) => void;
}

export function TransferTable({ transfers, onViewDetails }: TransferTableProps) {
  const getStatusColor = (status: Transfer["status"]) => {
    switch (status) {
      case "completed":
        return "badge-active";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "cancelled":
        return "badge-inactive";
      default:
        return "";
    }
  };

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transfer ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>From → To</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Transferred By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No transfers found matching your filters
              </TableCell>
            </TableRow>
          ) : (
            transfers.map((transfer) => (
              <TableRow key={transfer.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-sm">{transfer.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{transfer.patientName}</p>
                    <p className="text-xs text-muted-foreground">{transfer.patientId}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{transfer.fromHospital}</span>
                    <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{transfer.toHospital}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{transfer.date}</p>
                    <p className="text-xs text-muted-foreground">{transfer.time}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-sm truncate">{transfer.reason}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(transfer.status)}>
                    {transfer.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{transfer.transferredBy}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(transfer.id)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
