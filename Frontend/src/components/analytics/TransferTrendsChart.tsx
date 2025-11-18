import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TransferTrendsChartProps {
  days: number;
}

// Generate mock data based on days
const generateData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      "City General": Math.floor(Math.random() * 8) + 3,
      "County Medical": Math.floor(Math.random() * 6) + 2,
      "Regional Health": Math.floor(Math.random() * 5) + 1,
    });
  }
  
  return data;
};

export const TransferTrendsChart = ({ days }: TransferTrendsChartProps) => {
  const data = generateData(days);

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
