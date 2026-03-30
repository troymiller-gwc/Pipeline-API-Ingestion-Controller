import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const DOW_NAMES = ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOW_FULL = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatNum(n: number): string {
  return n.toLocaleString();
}

function getColor(count: number, avg: number): "green" | "yellow" | "red" | "gray" {
  if (avg === 0) return "gray";
  const pctDiff = Math.abs(count - avg) / avg;
  if (pctDiff <= 0.05) return "green";
  if (pctDiff <= 0.10) return "yellow";
  return "red";
}

const colorClasses = {
  green: "bg-green-100 border-green-400 text-green-900",
  yellow: "bg-yellow-100 border-yellow-400 text-yellow-900",
  red: "bg-red-100 border-red-400 text-red-900",
  gray: "bg-muted border-border text-muted-foreground",
};

const colorDotClasses = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  gray: "bg-gray-400",
};

interface DailyCount {
  contact_date: { value: string };
  dow: number;
  contact_count: number;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export default function InContactMonitorPage() {
  const [startDate, setStartDate] = useState("2026-01-01");

  const { data, isLoading, error } = useQuery({
    queryKey: ["contact-daily-counts", startDate],
    queryFn: () => api.monitor.contactDailyCounts(startDate),
  });

  const rows: DailyCount[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((r: any) => ({
      contact_date: typeof r.contact_date === "string" ? { value: r.contact_date } : r.contact_date,
      dow: Number(r.dow),
      contact_count: Number(r.contact_count),
    }));
  }, [data]);

  const dowAverages = useMemo(() => {
    const sums: Record<number, number[]> = {};
    for (let d = 1; d <= 7; d++) sums[d] = [];
    for (const r of rows) {
      sums[r.dow]?.push(r.contact_count);
    }
    const avgs: Record<number, number> = {};
    for (let d = 1; d <= 7; d++) {
      const arr = sums[d];
      avgs[d] = arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    }
    return avgs;
  }, [rows]);

  const calendarMonths = useMemo(() => {
    if (rows.length === 0) return [];

    const dateMap = new Map<string, DailyCount>();
    for (const r of rows) {
      dateMap.set(r.contact_date.value, r);
    }

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(today() + "T00:00:00");

    const months: { year: number; month: number; days: (DailyCount | null)[][] }[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

    while (cursor <= end) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const weeks: (DailyCount | null)[][] = [];
      let week: (DailyCount | null)[] = new Array(firstDay).fill(null);

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const entry = dateMap.get(dateStr) || null;
        week.push(entry ? entry : ({ contact_date: { value: dateStr }, dow: new Date(dateStr).getDay() + 1, contact_count: 0 } as DailyCount));

        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
      }
      if (week.length > 0) {
        while (week.length < 7) week.push(null);
        weeks.push(week);
      }

      months.push({ year, month, days: weeks });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return months;
  }, [rows, startDate]);

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">inContact Monitor</h1>
          <p className="text-muted-foreground text-sm">Daily contact volume with day-of-week variance analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="startDate" className="text-sm whitespace-nowrap">From</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">To</Label>
            <Input type="date" value={today()} disabled className="w-40" />
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Day of Week Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((dow) => (
              <div key={dow} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{DOW_FULL[dow]}</div>
                <div className="text-lg font-bold">{formatNum(dowAverages[dow] || 0)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-6 mb-4 text-xs">
        <span className="font-medium text-muted-foreground">Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block w-3 h-3 rounded ${colorDotClasses.green}`} />
          Within 5% of avg
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block w-3 h-3 rounded ${colorDotClasses.yellow}`} />
          5%–10% off avg
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block w-3 h-3 rounded ${colorDotClasses.red}`} />
          Over 10% off avg
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block w-3 h-3 rounded ${colorDotClasses.gray}`} />
          No data
        </span>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading contact data from BigQuery...</p>}
      {error && <p className="text-red-600">Error loading data: {(error as Error).message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {calendarMonths.map(({ year, month, days }) => (
          <Card key={`${year}-${month}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{MONTH_NAMES[month]} {year}</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-7 gap-px text-center text-[10px] text-muted-foreground mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-0.5 font-medium">{d}</div>
                ))}
              </div>
              {days.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-px">
                  {week.map((day, di) => {
                    if (!day) {
                      return <div key={di} className="h-12" />;
                    }
                    const dayNum = parseInt(day.contact_date.value.split("-")[2], 10);
                    const color = day.contact_count === 0 ? "gray" : getColor(day.contact_count, dowAverages[day.dow] || 0);
                    const avg = dowAverages[day.dow] || 0;
                    const pctDiff = avg > 0 ? ((day.contact_count - avg) / avg) * 100 : 0;
                    const arrow = day.contact_count === 0 || avg === 0 ? "" : pctDiff > 0 ? "▲" : pctDiff < 0 ? "▼" : "";
                    const arrowColor = day.contact_count === 0 || avg === 0 ? "" : pctDiff > 0 ? "text-green-700" : "text-red-700";
                    return (
                      <div
                        key={di}
                        className={`h-14 border rounded-sm flex flex-col items-center justify-center cursor-default transition-colors ${colorClasses[color]}`}
                        title={`${day.contact_date.value}: ${formatNum(day.contact_count)} contacts (${DOW_NAMES[day.dow]} avg: ${formatNum(avg)}, ${pctDiff >= 0 ? "+" : ""}${pctDiff.toFixed(1)}%)`}
                      >
                        <div className="text-[10px] leading-none opacity-70">{dayNum}</div>
                        <div className="text-[10px] font-bold leading-tight mt-0.5">
                          {day.contact_count > 0 ? formatNum(day.contact_count) : "—"}
                        </div>
                        {arrow && (
                          <div className={`text-[8px] font-bold leading-none ${arrowColor}`}>
                            {arrow} {Math.abs(pctDiff).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
