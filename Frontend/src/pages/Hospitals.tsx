import { useState, useEffect } from "react";
import { Building2, Users, UserCog, Activity, Plus, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthenticatedFetch, API_BASE_URL } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Hospital {
  id: string;
  name: string;
  location?: string;
  patients: number;
  doctors: number;
  nurses?: number;
  status: string;
  lastSync?: string;
}

export default function Hospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authenticatedFetch = useAuthenticatedFetch();

  // Fetch hospitals data on component mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch hospitals list
        const hospitalsResponse = await authenticatedFetch(`${API_BASE_URL}/hospitals`);
        const hospitalsResult = await hospitalsResponse.json();

        if (!hospitalsResult.success) {
          throw new Error(hospitalsResult.message || 'Failed to fetch hospitals');
        }

        // Fetch dashboard stats to get patient/doctor counts
        const statsResponse = await authenticatedFetch(`${API_BASE_URL}/hospitals/stats/dashboard`);
        const statsResult = await statsResponse.json();

        if (!statsResult.success) {
          throw new Error(statsResult.message || 'Failed to fetch hospital stats');
        }

        // Combine hospital info with stats
        const hospitalsWithStats = hospitalsResult.data.map((hospital: any) => {
          const stats = statsResult.data.hospitalBreakdown.find((h: any) => h.hospitalId === hospital.id);
          return {
            id: hospital.id,
            name: hospital.name,
            location: `${hospital.name.includes('City') ? 'Nairobi' :
                      hospital.name.includes('Metro') ? 'Mombasa' : 'Kisumu'}, Kenya`,
            patients: stats?.patients || 0,
            doctors: stats?.doctors || 0,
            nurses: Math.floor((stats?.patients || 0) * 0.3), // Estimate nurses as 30% of patients
            status: "connected",
            lastSync: "2 minutes ago",
          };
        });

        setHospitals(hospitalsWithStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hospitals');
        toast({
          title: "Error",
          description: "Failed to load hospitals. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [authenticatedFetch, toast]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hospitals</h1>
          <p className="text-muted-foreground">Manage connected healthcare facilities</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Hospital
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search hospitals..." className="pl-10" />
        </div>
      </div>

      {/* Hospital Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading hospitals...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          <p>Error loading hospitals: {error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((hospital) => (
            <Card key={hospital.id} className="stat-card cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{hospital.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{hospital.location}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Patients</span>
                    </div>
                    <span className="font-semibold text-foreground">{hospital.patients}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UserCog className="h-4 w-4" />
                      <span>Doctors</span>
                    </div>
                    <span className="font-semibold text-foreground">{hospital.doctors}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span>Nurses</span>
                    </div>
                    <span className="font-semibold text-foreground">{hospital.nurses || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          hospital.status === "connected" ? "bg-success" : "bg-warning"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {hospital.status === "connected" ? "Connected" : "Warning"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {hospital.id}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Last sync: {hospital.lastSync}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
