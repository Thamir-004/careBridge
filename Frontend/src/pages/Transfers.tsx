import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Filter, List, Activity, Loader2 } from "lucide-react";
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
import { useAuthenticatedFetch, API_BASE_URL } from "@/lib/api";
import { useHospital } from "@/contexts/HospitalContext";

export default function Transfers() {
  const [sourceHospital, setSourceHospital] = useState<string>("all");
  const [destinationHospital, setDestinationHospital] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const authenticatedFetch = useAuthenticatedFetch();
  const { selectedHospital } = useHospital();

  const { data: transfers, isLoading, error } = useQuery<any[]>({
    queryKey: ['transfers', 'all', selectedHospital.id],
    queryFn: async () => {
      console.log('[DEBUG] Transfers: Starting fetch for transfers, queryKey:', ['transfers', 'all', selectedHospital.id]);
      const response = await authenticatedFetch(`${API_BASE_URL}/transfer/all/list?hospital=${selectedHospital.id}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch transfers');
      }

      console.log('[DEBUG] Transfers: Fetched transfers data, count:', result.data?.length || 0);
      return result.data;
    },
  });

  useEffect(() => {
    if (transfers) {
      console.log('[DEBUG] Transfers: Data updated, length:', transfers.length);
    }
  }, [transfers]);

  useEffect(() => {
    if (error) {
      console.log('[DEBUG] Transfers: Error occurred:', error);
    }
  }, [error]);

  useEffect(() => {
    if (error) {
      console.error('[DEBUG] Transfers: Fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load transfers. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filter transfers based on selected criteria
  const filteredTransfers = (transfers || []).filter((transfer) => {
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
              <strong>{transfers?.length || 0}</strong> transfers
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading transfers...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                <p>Error loading transfers: {error.message}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
