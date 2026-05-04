"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";
import { format, parseISO, subDays, eachDayOfInterval } from "date-fns";

type Conflict = {
  id: string;
  title: string;
  whoStarted: string;
  date: string;
  category?: string | null;
  severity?: number | null;
  outcome?: string | null;
  moodAfter?: string | null;
};

const COLORS = ["#8b7cf6", "#c4b5fd", "#a78bfa", "#7c6ae0", "#6d5bd0", "#5d4bc0", "#4c3ab0"];
const OUTCOME_COLORS: Record<string, string> = {
  RESOLVED: "#4ade80",
  UNRESOLVED: "#f87171",
  ONGOING: "#fbbf24",
  WALKED_AWAY: "#94a3b8",
};

const categoryLabel: Record<string, string> = {
  MONEY: "Money", HOUSEHOLD: "Household", FAMILY: "Family",
  INTIMACY: "Intimacy", COMMUNICATION: "Communication",
  PARENTING: "Parenting", WORK: "Work", OTHER: "Other",
};

const moodLabel: Record<string, string> = {
  CALM: "Calm", ANGRY: "Angry", SAD: "Sad", HURT: "Hurt", NUMB: "Numb", RELIEVED: "Relieved",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 text-center">
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-6 mb-3">
      {title}
    </h2>
  );
}

export default function AnalysisPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conflicts")
      .then((r) => r.json())
      .then((d) => { setConflicts(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8">
        <div className="h-6 w-32 bg-muted rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (conflicts.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 text-center text-muted-foreground py-20">
        <p className="text-3xl mb-2">📊</p>
        <p className="text-sm">No data yet. Log some conflicts to see your analysis.</p>
      </div>
    );
  }

  // --- Computed data ---

  // Summary stats
  const total = conflicts.length;
  const resolved = conflicts.filter((c) => c.outcome === "RESOLVED").length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const avgSeverity =
    conflicts.filter((c) => c.severity).length > 0
      ? (
          conflicts.reduce((s, c) => s + (c.severity || 0), 0) /
          conflicts.filter((c) => c.severity).length
        ).toFixed(1)
      : "—";

  // Last 30 days frequency
  const today = new Date();
  const days = eachDayOfInterval({ start: subDays(today, 29), end: today });
  const freqData = days.map((d) => ({
    day: format(d, "MMM d"),
    count: conflicts.filter(
      (c) => format(parseISO(c.date), "yyyy-MM-dd") === format(d, "yyyy-MM-dd")
    ).length,
  }));

  // Topic breakdown
  const topicMap: Record<string, number> = {};
  for (const c of conflicts) {
    const k = c.category || "OTHER";
    topicMap[k] = (topicMap[k] || 0) + 1;
  }
  const topicData = Object.entries(topicMap)
    .map(([k, v]) => ({ name: categoryLabel[k] || k, value: v }))
    .sort((a, b) => b.value - a.value);

  // Initiator breakdown
  const whoMap: Record<string, number> = { ME: 0, PARTNER: 0, MUTUAL: 0 };
  for (const c of conflicts) whoMap[c.whoStarted] = (whoMap[c.whoStarted] || 0) + 1;
  const whoData = [
    { name: "Me", value: whoMap.ME, color: "#f87171" },
    { name: "Partner", value: whoMap.PARTNER, color: "#60a5fa" },
    { name: "Mutual", value: whoMap.MUTUAL, color: "#fbbf24" },
  ].filter((d) => d.value > 0);

  // Outcome breakdown
  const outcomeMap: Record<string, number> = {};
  for (const c of conflicts) {
    const k = c.outcome || "UNRECORDED";
    outcomeMap[k] = (outcomeMap[k] || 0) + 1;
  }
  const outcomeData = Object.entries(outcomeMap).map(([k, v]) => ({
    name: k === "WALKED_AWAY" ? "Walked away" : k === "UNRECORDED" ? "Not recorded" : k.charAt(0) + k.slice(1).toLowerCase(),
    value: v,
    color: OUTCOME_COLORS[k] || "#94a3b8",
  }));

  // Severity trend (weekly avg over last 8 weeks)
  const severityTrend: { week: string; avg: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const start = subDays(today, w * 7 + 6);
    const end = subDays(today, w * 7);
    const week = conflicts.filter((c) => {
      const d = parseISO(c.date);
      return d >= start && d <= end && c.severity;
    });
    if (week.length > 0) {
      severityTrend.push({
        week: format(end, "MMM d"),
        avg: parseFloat(
          (week.reduce((s, c) => s + (c.severity || 0), 0) / week.length).toFixed(1)
        ),
      });
    }
  }

  // Mood breakdown
  const moodMap: Record<string, number> = {};
  for (const c of conflicts) {
    if (c.moodAfter) moodMap[c.moodAfter] = (moodMap[c.moodAfter] || 0) + 1;
  }
  const moodData = Object.entries(moodMap)
    .map(([k, v]) => ({ name: moodLabel[k] || k, value: v }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-foreground">Analysis</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Patterns in your conflicts</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total conflicts" value={total} />
        <StatCard label="Resolution rate" value={`${resolutionRate}%`} sub={`${resolved} resolved`} />
        <StatCard label="Avg severity" value={avgSeverity} sub="out of 5" />
        <StatCard
          label="Most common topic"
          value={topicData[0]?.name || "—"}
        />
      </div>

      {/* Frequency – last 30 days */}
      <SectionTitle title="Conflicts over last 30 days" />
      <div className="bg-card border border-border rounded-2xl p-4">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={freqData} margin={{ left: -20 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              interval={4}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
              cursor={{ fill: "#f1f5f9" }}
            />
            <Bar dataKey="count" name="Conflicts" fill="#8b7cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Initiator pie */}
      <SectionTitle title="Who starts it" />
      <div className="bg-card border border-border rounded-2xl p-4">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={whoData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {whoData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Topic breakdown */}
      {topicData.length > 0 && (
        <>
          <SectionTitle title="Conflict topics" />
          <div className="bg-card border border-border rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={Math.max(120, topicData.length * 32)}>
              <BarChart data={topicData} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={90} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                  {topicData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Outcome breakdown */}
      {outcomeData.length > 0 && (
        <>
          <SectionTitle title="Outcomes" />
          <div className="bg-card border border-border rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {outcomeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Severity trend */}
      {severityTrend.length >= 2 && (
        <>
          <SectionTitle title="Severity trend (weekly avg)" />
          <div className="bg-card border border-border rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={severityTrend} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name="Avg severity"
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#f87171" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Mood after */}
      {moodData.length > 0 && (
        <>
          <SectionTitle title="Mood after conflicts" />
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="space-y-2">
              {moodData.map(({ name, value }) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-20 shrink-0">{name}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(value / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
