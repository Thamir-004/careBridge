import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor: "blue" | "green" | "purple" | "teal";
}

const iconColorClasses = {
  blue: "bg-stat-blue/10 text-stat-blue",
  green: "bg-stat-green/10 text-stat-green",
  purple: "bg-stat-purple/10 text-stat-purple",
  teal: "bg-stat-teal/10 text-stat-teal",
};

export const StatCard = ({ title, value, icon: Icon, trend, iconColor }: StatCardProps) => {
  return (
    <Card className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <span className={trend.isPositive ? "text-success" : "text-destructive"}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={`rounded-lg p-3 ${iconColorClasses[iconColor]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};
