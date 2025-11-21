import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TransferTrendsChartProps {
  data: any[];
}

export const TransferTrendsChart = ({ data }: TransferTrendsChartProps) => {
  // Transform the data to match the expected format for the chart
  const chartData = data?.map((item: any) => ({
    date: item.date,
    "City General": item.cityGeneral || 0,
    "County Medical": item.countyMedical || 0,
    "Regional Health": item.regionalHealth || 0,
  })) || [];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            className="text-xs text-muted-foreground"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs text-muted-foreground"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              color: "hsl(var(--popover-foreground))",
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Line
            type="monotone"
            dataKey="City General"
            stroke="hsl(var(--stat-blue))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--stat-blue))", r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="County Medical"
            stroke="hsl(var(--stat-green))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--stat-green))", r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Regional Health"
            stroke="hsl(var(--stat-purple))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--stat-purple))", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
