import { Sankey, Tooltip, ResponsiveContainer } from "recharts";

const data = {
  nodes: [
    { name: "City General" },
    { name: "County Medical" },
    { name: "Regional Health" },
  ],
  links: [
    { source: 0, target: 1, value: 45 },
    { source: 0, target: 2, value: 32 },
    { source: 1, target: 0, value: 38 },
    { source: 1, target: 2, value: 28 },
    { source: 2, target: 0, value: 25 },
    { source: 2, target: 1, value: 22 },
  ],
};

export const HospitalNetworkChart = () => {
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
