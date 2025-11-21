import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, Mail, FileText, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransferTrendsChart } from "@/components/analytics/TransferTrendsChart";
import { PatientDistributionChart } from "@/components/analytics/PatientDistributionChart";
import { TransferReasonsChart } from "@/components/analytics/TransferReasonsChart";
import { HospitalNetworkChart } from "@/components/analytics/HospitalNetworkChart";
import { TopTransferredPatientsTable } from "@/components/analytics/TopTransferredPatientsTable";
import { BusiestRoutesTable } from "@/components/analytics/BusiestRoutesTable";
import { HospitalStatsTable } from "@/components/analytics/HospitalStatsTable";
import { Badge } from "@/components/ui/badge";
import { useAuthenticatedFetch, API_BASE_URL } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useHospital } from "@/contexts/HospitalContext";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30");
  const authenticatedFetch = useAuthenticatedFetch();
  const { selectedHospital } = useHospital();

  const { data: analyticsData, isLoading, error } = useQuery<any>({
    queryKey: ['analytics', 'overview', selectedHospital.id, dateRange],
    queryFn: async () => {
      console.log('[DEBUG] Analytics: Starting fetch for dateRange:', dateRange);
      const response = await authenticatedFetch(`${API_BASE_URL}/hospitals/analytics/overview?days=${dateRange}&hospital=${selectedHospital.id}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch analytics data');
      }

      console.log('[DEBUG] Analytics: Fetched analytics data, keys:', Object.keys(result.data || {}));
      return result.data;
    },
  });

  useEffect(() => {
    if (error) {
      console.error('[DEBUG] Analytics: Fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log("Exporting as PDF...");
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log("Exporting as Excel...");
  };

  const handleEmailReport = () => {
    // TODO: Implement email report
    console.log("Emailing report...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Track transfers, patient distribution, and hospital performance
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleExportPDF}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExportExcel}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleEmailReport}>
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analyticsData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.busiestRoutes.reduce((sum: number, route: any) => sum + route.transfers, 0)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success">+12.5%</span> from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Transfer Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2 hrs</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success">-8.3%</span> from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.2%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success">+1.2%</span> from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.busiestRoutes.length}</div>
              <p className="text-xs text-muted-foreground">Between {analyticsData.patientDistribution.length} hospitals</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="reasons">Reasons</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Trends</CardTitle>
              <CardDescription>
                Daily transfer volume across all hospitals over the last {dateRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData ? (
                <TransferTrendsChart data={analyticsData.transferTrends} />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Distribution</CardTitle>
                <CardDescription>Current patient count by hospital</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData ? (
                  <PatientDistributionChart data={analyticsData.patientDistribution} />
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Distribution Summary</CardTitle>
                <CardDescription>Detailed breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData ? (
                  <div className="space-y-4">
                    {analyticsData.patientDistribution.map((hospital: any, index: number) => {
                      const totalPatients = analyticsData.patientDistribution.reduce((sum: number, h: any) => sum + h.value, 0);
                      const percentage = Math.round((hospital.value / totalPatients) * 100);
                      return (
                        <div key={hospital.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${
                              index === 0 ? 'bg-stat-blue' :
                              index === 1 ? 'bg-stat-green' : 'bg-stat-purple'
                            }`} />
                            <span className="text-sm">{hospital.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold">{hospital.value.toLocaleString()}</span>
                            <Badge variant="outline">{percentage}%</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reasons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Reasons</CardTitle>
              <CardDescription>
                Most common reasons for patient transfers in the last {dateRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData ? (
                <TransferReasonsChart data={analyticsData.transferReasons} />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Network</CardTitle>
              <CardDescription>
                Transfer flow between hospitals (line thickness indicates volume)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData ? (
                <HospitalNetworkChart data={analyticsData.hospitalNetwork} />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Transferred Patients</CardTitle>
            <CardDescription>Patients with most transfer records</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData ? (
              <TopTransferredPatientsTable data={analyticsData.topTransferredPatients} />
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Busiest Transfer Routes</CardTitle>
            <CardDescription>Most frequently used hospital connections</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData ? (
              <BusiestRoutesTable data={analyticsData.busiestRoutes} />
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hospital Statistics Comparison</CardTitle>
          <CardDescription>Comprehensive performance metrics across all facilities</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData ? (
            <HospitalStatsTable data={analyticsData.hospitalStats} />
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
