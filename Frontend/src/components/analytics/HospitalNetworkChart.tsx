import { Sankey, Tooltip, ResponsiveContainer } from "recharts";

interface HospitalNetworkChartProps {
  data: any;
}

export const HospitalNetworkChart = ({ data }: HospitalNetworkChartProps) => {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={data}
          node={{
            fill: "hsl(var(--primary))",
            stroke: "hsl(var(--border))",
          }}
          link={{
            stroke: "hsl(var(--muted-foreground))",
            strokeOpacity: 0.3,
          }}
          nodePadding={50}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              color: "hsl(var(--popover-foreground))",
            }}
          />
        </Sankey>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Transfer flow between hospitals (thicker lines = higher volume)</p>
      </div>
    </div>
  );
};
