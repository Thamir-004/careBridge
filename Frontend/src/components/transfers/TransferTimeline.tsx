import { ArrowLeftRight, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface TransferTimelineProps {
  transfers: Transfer[];
}

export function TransferTimeline({ transfers }: TransferTimelineProps) {
  // Group transfers by date
  const groupedTransfers = transfers.reduce((acc, transfer) => {
    const date = transfer.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transfer);
    return acc;
  }, {} as Record<string, Transfer[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

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
    <div className="space-y-8">
      {Object.entries(groupedTransfers).map(([date, dayTransfers]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">{formatDate(date)}</h3>
          </div>
          <div className="relative space-y-4 pl-8">
            {/* Timeline line */}
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

            {dayTransfers.map((transfer, index) => (
              <div key={transfer.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-6 top-3 h-3 w-3 rounded-full border-2 border-primary bg-background" />

                {/* Transfer card */}
                <div className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          {transfer.id}
                        </span>
                        <Badge
                          variant="outline"
                          className={getStatusColor(transfer.status)}
                        >
                          {transfer.status}
                        </Badge>
                      </div>
                      <p className="font-semibold text-foreground">
                        {transfer.patientName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transfer.patientId}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {transfer.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-medium text-foreground">
                      {transfer.fromHospital}
                    </span>
                    <ArrowLeftRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">
                      {transfer.toHospital}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <span className="font-medium">Reason:</span>
                      <span>{transfer.reason}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="text-xs">Transferred by {transfer.transferredBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
