"use client";

import { useEffect, useState } from "react";
import { format, isToday, parseISO } from "date-fns";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConflictForm, { ConflictFormData } from "@/components/conflict-form";
import ConflictCard from "@/components/conflict-card";
import { useSession } from "next-auth/react";

type Conflict = {
  id: string;
  title: string;
  whoStarted: string;
  date: string;
  category?: string | null;
  severity?: number | null;
  outcome?: string | null;
  notes?: string | null;
  duration?: number | null;
  moodAfter?: string | null;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date();

  async function fetchConflicts() {
    const res = await fetch("/api/conflicts");
    const data = await res.json();
    setConflicts(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchConflicts();
  }, []);

  async function handleCreate(data: ConflictFormData) {
    const res = await fetch("/api/conflicts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setShowForm(false);
      fetchConflicts();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this entry?")) return;
    await fetch(`/api/conflicts/${id}`, { method: "DELETE" });
    fetchConflicts();
  }

  async function handleUpdate(id: string, data: ConflictFormData) {
    await fetch(`/api/conflicts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchConflicts();
  }

  const todaysConflicts = conflicts.filter((c) =>
    isToday(parseISO(c.date))
  );

  const name = session?.user?.name?.split(" ")[0] || "there";
  const hour = today.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          {greeting}, {name}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {format(today, "EEEE, MMMM d")}
        </p>
      </div>

      {/* Quick log button / form */}
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full h-12 rounded-2xl flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Log a conflict
        </Button>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-foreground">New entry</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <ConflictForm onSubmit={handleCreate} submitLabel="Log conflict" />
        </div>
      )}

      {/* Today's conflicts */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Today
          </h2>
          <span className="text-xs text-muted-foreground">
            {todaysConflicts.length} {todaysConflicts.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : todaysConflicts.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-3xl mb-2">🌊</p>
            <p className="text-sm">No conflicts today.</p>
            <p className="text-xs mt-1 opacity-70">Still waters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysConflicts.map((c) => (
              <ConflictCard
                key={c.id}
                conflict={c}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats strip */}
      {!loading && conflicts.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            {
              label: "Total",
              value: conflicts.length,
            },
            {
              label: "This month",
              value: conflicts.filter(
                (c) =>
                  new Date(c.date).getMonth() === today.getMonth() &&
                  new Date(c.date).getFullYear() === today.getFullYear()
              ).length,
            },
            {
              label: "Resolved",
              value: conflicts.filter((c) => c.outcome === "RESOLVED").length,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-2xl p-3 text-center"
            >
              <p className="text-xl font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
