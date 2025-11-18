import { Users, UserCog, ArrowLeftRight, Building2, Plus, Search, FileText, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const recentTransfers = [
  {
    id: "TRF-001",
    patient: "John Doe",
    from: "City General",
    to: "County Medical",
    time: "2 hours ago",
    status: "completed",
  },
  {
    id: "TRF-002",
    patient: "Mary Atieno",
    from: "Regional Health",
    to: "City General",
    time: "5 hours ago",
    status: "completed",
  },
  {
    id: "TRF-003",
    patient: "David Kamau",
    from: "County Medical",
    to: "Regional Health",
    time: "1 day ago",
    status: "completed",
  },
];

const quickActions = [
  { label: "New Patient", icon: Plus, href: "/patients", variant: "default" as const },
  { label: "Transfer Patient", icon: ArrowLeftRight, href: "/transfer", variant: "default" as const },
  { label: "Search Records", icon: Search, href: "/search", variant: "outline" as const },
  { label: "View Reports", icon: FileText, href: "/analytics", variant: "outline" as const },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Dr. Sarah Johnson</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Patients"
          value="1,234"
          icon={Users}
          iconColor="blue"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Total Doctors"
          value="89"
          icon={UserCog}
          iconColor="green"
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          title="Transfers Today"
          value="12"
          icon={ArrowLeftRight}
          iconColor="purple"
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard
          title="Connected Hospitals"
          value="3"
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
            {["City General Hospital", "County Medical Center", "Regional Health Facility"].map(
              (hospital, index) => (
                <div
                  key={hospital}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{hospital}</p>
                      <p className="text-xs text-muted-foreground">Last sync: 5 min ago</p>
                    </div>
                  </div>
                  <div className="flex h-2 w-2 rounded-full bg-success" />
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
