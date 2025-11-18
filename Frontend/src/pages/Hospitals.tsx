import { Building2, Users, UserCog, Activity, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const hospitals = [
  {
    id: "HOSP_A_001",
    name: "City General Hospital",
    location: "Nairobi, Kenya",
    patients: 1234,
    doctors: 45,
    nurses: 120,
    status: "connected",
    lastSync: "2 minutes ago",
  },
  {
    id: "HOSP_B_001",
    name: "County Medical Center",
    location: "Mombasa, Kenya",
    patients: 890,
    doctors: 32,
    nurses: 85,
    status: "connected",
    lastSync: "5 minutes ago",
  },
  {
    id: "HOSP_C_001",
    name: "Regional Health Facility",
    location: "Kisumu, Kenya",
    patients: 567,
    doctors: 28,
    nurses: 62,
    status: "warning",
    lastSync: "45 minutes ago",
  },
];

export default function Hospitals() {
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
                  <span className="font-semibold text-foreground">{hospital.nurses}</span>
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
    </div>
  );
}
