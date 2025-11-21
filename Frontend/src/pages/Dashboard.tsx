import { useState, useEffect } from "react";
import { Users, UserCog, ArrowLeftRight, Building2, Plus, Search, FileText, Clock, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/hooks/useSocket";
import { useAuthenticatedFetch, API_BASE_URL } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useHospital } from "@/contexts/HospitalContext";
import { useUser } from '@clerk/clerk-react';

const quickActions = [
  { label: "New Patient", icon: Plus, href: "/patients", variant: "default" as const },
  { label: "Transfer Patient", icon: ArrowLeftRight, href: "/transfer", variant: "default" as const },
  { label: "Search Records", icon: Search, href: "/search", variant: "outline" as const },
  { label: "View Reports", icon: FileText, href: "/analytics", variant: "outline" as const },
];

export default function Dashboard() {
  const { selectedHospital } = useHospital();
  const { user } = useUser();
  const [stats, setStats] = useState({
    activePatients: 0,
    totalDoctors: 0,
    transfersToday: 0,
    connectedHospitals: 0,
  });
  const [recentTransfers, setRecentTransfers] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authenticatedFetch = useAuthenticatedFetch();

  // Connect to Socket.IO for real-time notifications
  useSocket(selectedHospital.id);

  // Fetch dashboard data on component mount and when hospital changes
  useEffect(() => {
    console.log('Dashboard: useEffect triggered, loading state:', loading, 'selectedHospital:', selectedHospital.id);
    const fetchDashboardData = async () => {
      if (loading) {
        console.log('Dashboard: Already loading, skipping fetch');
        return;
      }
      console.log('Dashboard: Proceeding with fetch');
      try {
        console.log('Dashboard: Starting fetch for hospital:', selectedHospital.id);
        setLoading(true);
        setError(null);

        // Fetch dashboard stats
        console.log('Dashboard: Fetching stats from API...');
        const statsResponse = await authenticatedFetch(`${API_BASE_URL}/hospitals/stats/dashboard`);
        console.log('Dashboard: Stats response status:', statsResponse.status);
        if (!statsResponse.ok) {
          throw new Error(`Stats API failed: ${statsResponse.status}`);
        }
        const statsResult = await statsResponse.json();
        console.log('Dashboard: Stats result success:', statsResult.success, 'data keys:', Object.keys(statsResult.data || {}));

        if (statsResult.success) {
          // Filter data for selected hospital
          const selectedHospitalData = statsResult.data.hospitalBreakdown.find(
            (h: any) => h.hospitalId === selectedHospital.id
          );

          if (selectedHospitalData) {
            console.log('Dashboard: Using selected hospital data:', selectedHospitalData);
            setStats({
              activePatients: selectedHospitalData.patients,
              totalDoctors: selectedHospitalData.doctors,
              transfersToday: selectedHospitalData.transfers,
              connectedHospitals: statsResult.data.connectedHospitals,
            });

            // Set system health from hospital breakdown
            setSystemHealth(statsResult.data.hospitalBreakdown.map((h: any) => ({
              name: h.name,
              patients: h.patients,
              lastSync: "5 min ago", // Placeholder
            })));
          } else {
            console.log('Dashboard: Selected hospital not found in breakdown, using aggregate data');
            // Fallback to aggregate data if hospital not found
            setStats({
              activePatients: statsResult.data.activePatients,
              totalDoctors: statsResult.data.totalDoctors,
              transfersToday: statsResult.data.transfersToday,
              connectedHospitals: statsResult.data.connectedHospitals,
            });

            setSystemHealth(statsResult.data.hospitalBreakdown.map((h: any) => ({
              name: h.name,
              patients: h.patients,
              lastSync: "5 min ago", // Placeholder
            })));
          }
        }

        // Fetch recent transfers
        console.log('Dashboard: Fetching transfers from API...');
        const transfersResponse = await authenticatedFetch(`${API_BASE_URL}/transfer/all/list?limit=3&fromHospital=${encodeURIComponent(selectedHospital.name)}&toHospital=${encodeURIComponent(selectedHospital.name)}`);
        console.log('Dashboard: Transfers response status:', transfersResponse.status);
        if (!transfersResponse.ok) {
          throw new Error(`Transfers API failed: ${transfersResponse.status}`);
        }
        const transfersResult = await transfersResponse.json();
        console.log('Dashboard: Transfers result success:', transfersResult.success, 'data length:', transfersResult.data?.length || 0);

        if (transfersResult.success) {
          const formattedTransfers = transfersResult.data.map((t: any) => ({
            id: t.id,
            patient: t.patientName,
            from: t.fromHospital,
            to: t.toHospital,
            time: `${Math.floor((Date.now() - new Date(t.date + ' ' + t.time).getTime()) / (1000 * 60 * 60))} hours ago`,
            status: t.status,
          }));
          setRecentTransfers(formattedTransfers);
        }

      } catch (err) {
        console.error('Dashboard: Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        console.log('Dashboard: Fetch complete, loading false');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authenticatedFetch, selectedHospital]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Error loading dashboard: {error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user?.firstName || user?.fullName || 'User'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Patients"
          value={stats.activePatients.toLocaleString()}
          icon={Users}
          iconColor="blue"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Total Doctors"
          value={stats.totalDoctors.toString()}
          icon={UserCog}
          iconColor="green"
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          title="Transfers Today"
          value={stats.transfersToday.toString()}
          icon={ArrowLeftRight}
          iconColor="purple"
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard
          title="Connected Hospitals"
          value={stats.connectedHospitals.toString()}
          icon={Building2}
          iconColor="teal"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transfers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Transfers
            </CardTitle>
            <CardDescription>Latest patient transfers across hospitals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{transfer.patient}</p>
                      <Badge variant="outline" className="badge-active">
                        {transfer.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{transfer.from}</span>
                      <ArrowLeftRight className="h-3 w-3" />
                      <span>{transfer.to}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{transfer.time}</p>
                    <p className="text-xs text-muted-foreground">{transfer.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant}
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <a href={action.href}>
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Hospital connection status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {systemHealth.map((hospital, index) => {
              const isSelected = hospital.name === selectedHospital.name;
              return (
                <div
                  key={hospital.name}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isSelected ? 'bg-primary/20' : 'bg-primary/10'
                    }`}>
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}>
                        {hospital.name}
                        {isSelected && <span className="ml-2 text-xs">(Current)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">Patients: {hospital.patients} | Last sync: {hospital.lastSync}</p>
                    </div>
                  </div>
                  <div className={`flex h-2 w-2 rounded-full ${
                    isSelected ? 'bg-primary' : 'bg-success'
                  }`} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
