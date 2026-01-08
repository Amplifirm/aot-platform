"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";

interface HistoryData {
  date: string;
  avgAccomplishments: string;
  avgOffenses: string;
  avgTotal: string;
  totalVotes: number;
  masterTotal: string | null;
  authTotal: string | null;
}

interface EventData {
  id: string;
  date: string;
  label: string;
  description: string | null;
}

interface ScoreHistoryChartProps {
  data: HistoryData[];
  events?: EventData[];
}

export function ScoreHistoryChart({ data, events = [] }: ScoreHistoryChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: format(new Date(d.date), "MMM d"),
      rawDate: d.date,
      A: parseFloat(d.avgAccomplishments),
      O: parseFloat(d.avgOffenses),
      T: parseFloat(d.avgTotal),
      Master: d.masterTotal ? parseFloat(d.masterTotal) : null,
      Auth: d.authTotal ? parseFloat(d.authTotal) : null,
      votes: d.totalVotes,
    }));
  }, [data]);

  if (chartData.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30">
        <p className="text-muted-foreground">Need at least 2 data points for chart</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          domain={[-10, 10]}
          tick={{ fontSize: 12 }}
          tickLine={false}
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value, name) => {
            if (value === undefined) return ["N/A", name];
            const numValue = typeof value === "number" ? value : 0;
            return [numValue.toFixed(1), String(name)];
          }}
        />
        <Legend />

        {/* Event reference lines */}
        {events.map((event) => {
          const eventDate = format(new Date(event.date), "MMM d");
          return (
            <ReferenceLine
              key={event.id}
              x={eventDate}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: event.label,
                position: "top",
                fontSize: 10,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
          );
        })}

        <Line
          type="monotone"
          dataKey="A"
          name="Accomplishments"
          stroke="hsl(142, 71%, 45%)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="O"
          name="Offenses"
          stroke="hsl(0, 84%, 60%)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="T"
          name="Total"
          stroke="hsl(217, 91%, 60%)"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="Master"
          name="Master Score"
          stroke="hsl(280, 100%, 70%)"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
