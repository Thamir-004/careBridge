import { useState } from "react";
import { Calendar, Filter, List, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransferTimeline } from "@/components/transfers/TransferTimeline";
import { TransferTable } from "@/components/transfers/TransferTable";
import { toast } from "@/hooks/use-toast";

// Mock transfer data
const allTransfers = [
  {
    id: "TRF-001",
    patientName: "John Doe",
    patientId: "PAT-A-001",
    fromHospital: "City General",
    toHospital: "County Medical",
    date: new Date().toISOString().split("T")[0],
    time: "14:30",
    reason: "Specialist care required - Cardiology consultation",
    status: "completed" as const,
    transferredBy: "Dr. Amina Omar",
  },
  {
    id: "TRF-002",
    patientName: "Mary Atieno",
    patientId: "PAT-A-002",
    fromHospital: "County Medical",
    toHospital: "City General",
    date: new Date().toISOString().split("T")[0],
    time: "11:15",
    reason: "Emergency transfer - Trauma care",
    status: "completed" as const,
    transferredBy: "Dr. John Mwangi",
  },
  {
    id: "TRF-003",
    patientName: "David Kamau",
    patientId: "PAT-A-003",
    fromHospital: "City General",
    toHospital: "Metro Hospital",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    time: "16:45",
    reason: "Patient request - Family proximity",
    status: "completed" as const,
    transferredBy: "Dr. Sarah Njeri",
  },
  {
    id: "TRF-004",
    patientName: "Sarah Wanjiku",
    patientId: "PAT-A-004",
    fromHospital: "Metro Hospital",
    toHospital: "City General",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    time: "09:20",
    reason: "Specialist care required - Oncology",
    status: "completed" as const,
    transferredBy: "Dr. Michael Ochieng",
  },
  {
    id: "TRF-005",
    patientName: "James Omondi",
    patientId: "PAT-A-005",
    fromHospital: "County Medical",
    toHospital: "Metro Hospital",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    time: "13:00",
    reason: "ICU availability",
    status: "completed" as const,
    transferredBy: "Dr. Jane Wambui",
  },
  {
    id: "TRF-006",
    patientName: "Grace Akinyi",
    patientId: "PAT-B-012",
    fromHospital: "City General",
    toHospital: "County Medical",
    date: new Date(Date.now() - 259200000).toISOString().split("T")[0],
    time: "10:30",
    reason: "Specialist care required - Neurology",
    status: "completed" as const,
    transferredBy: "Dr. Peter Kipchoge",
  },
  {
    id: "TRF-007",
    patientName: "Peter Mutua",
    patientId: "PAT-C-045",
    fromHospital: "Metro Hospital",
    toHospital: "City General",
    date: new Date(Date.now() - 345600000).toISOString().split("T")[0],
    time: "15:45",
    reason: "Emergency transfer - Surgical intervention needed",
    status: "completed" as const,
    transferredBy: "Dr. Lucy Chebet",
  },
  {
    id: "TRF-008",
    patientName: "Alice Njoki",
    patientId: "PAT-A-008",
    fromHospital: "County Medical",
    toHospital: "Metro Hospital",
    date: new Date().toISOString().split("T")[0],
    time: "08:00",
    reason: "Equipment availability - MRI scan required",
    status: "pending" as const,
    transferredBy: "Dr. Daniel Korir",
  },
];

export default function Transfers() {
  const [sourceHospital, setSourceHospital] = useState<string>("all");
  const [destinationHospital, setDestinationHospital] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter transfers based on selected criteria
  const filteredTransfers = allTransfers.filter((transfer) => {
    const matchesSource =
      sourceHospital === "all" || transfer.fromHospital === sourceHospital;
    const matchesDestination =
      destinationHospital === "all" || transfer.toHospital === destinationHospital;
    const matchesStatus = statusFilter === "all" || transfer.status === statusFilter;

    return matchesSource && matchesDestination && matchesStatus;
  });

  const handleViewDetails = (transferId: string) => {
    toast({
      title: "Transfer Details",
      description: `Viewing details for transfer ${transferId}`,
    });
  };

  const handleResetFilters = () => {
    setSourceHospital("all");
    setDestinationHospital("all");
    setStatusFilter("all");
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared",
    });
  };

  const hospitals = ["City General", "County Medical", "Metro Hospital"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transfer History</h1>
          <p className="text-muted-foreground">
            View and manage all patient transfers across hospitals
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={sourceHospital} onValueChange={setSourceHospital}>
              <SelectTrigger>
                <SelectValue placeholder="Source Hospital" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Sources</SelectItem>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital} value={hospital}>
                    {hospital}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={destinationHospital}
              onValueChange={setDestinationHospital}
            >
              <SelectTrigger>
                <SelectValue placeholder="Destination Hospital" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Destinations</SelectItem>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital} value={hospital}>
                    {hospital}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing <strong>{filteredTransfers.length}</strong> of{" "}
              <strong>{allTransfers.length}</strong> transfers
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline and Table Views */}
      <Card>
        <Tabs defaultValue="timeline" className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transfer Records</CardTitle>
              <TabsList>
                <TabsTrigger value="timeline" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="table" className="gap-2">
                  <List className="h-4 w-4" />
                  Table
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="timeline" className="mt-0">
              {filteredTransfers.length > 0 ? (
                <TransferTimeline transfers={filteredTransfers} />
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Transfers Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters to see more results
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="table" className="mt-0">
              <TransferTable
                transfers={filteredTransfers}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
