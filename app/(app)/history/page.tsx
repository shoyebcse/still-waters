"use client";

import { useEffect, useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConflictCard from "@/components/conflict-card";
import { ConflictFormData } from "@/components/conflict-form";

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

export default function HistoryPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("");
  const [filterWho, setFilterWho] = useState("");

  const fetchConflicts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterCategory) params.set("category", filterCategory);
    if (filterOutcome) params.set("outcome", filterOutcome);
    if (filterWho) params.set("whoStarted", filterWho);
    const res = await fetch(`/api/conflicts?${params}`);
    const data = await res.json();
    setConflicts(data);
    setLoading(false);
  }, [filterCategory, filterOutcome, filterWho]);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

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

  function clearFilters() {
    setFilterCategory("");
    setFilterOutcome("");
    setFilterWho("");
  }

  const hasFilters = filterCategory || filterOutcome || filterWho;

  const filtered = conflicts.filter((c) =>
    search
      ? c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.notes || "").toLowerCase().includes(search.toLowerCase())
      : true
  );

  // Group by month
  const grouped: Record<string, Conflict[]> = {};
  for (const c of filtered) {
    const key = format(parseISO(c.date), "MMMM yyyy");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-foreground">History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All your logged conflicts</p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title or notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearch("")}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          size="sm"
          variant={showFilters ? "default" : "outline"}
          className="h-8 gap-1.5"
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasFilters && (
            <span className="ml-1 bg-primary-foreground text-primary text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {[filterCategory, filterOutcome, filterWho].filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-muted/50 rounded-xl">
          <Select value={filterCategory} onValueChange={(v: string | null) => setFilterCategory(!v || v === "all" ? "" : v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              <SelectItem value="MONEY">Money</SelectItem>
              <SelectItem value="HOUSEHOLD">Household</SelectItem>
              <SelectItem value="FAMILY">Family</SelectItem>
              <SelectItem value="INTIMACY">Intimacy</SelectItem>
              <SelectItem value="COMMUNICATION">Communication</SelectItem>
              <SelectItem value="PARENTING">Parenting</SelectItem>
              <SelectItem value="WORK">Work</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterOutcome} onValueChange={(v: string | null) => setFilterOutcome(!v || v === "all" ? "" : v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All outcomes</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="UNRESOLVED">Unresolved</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="WALKED_AWAY">Walked away</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterWho} onValueChange={(v: string | null) => setFilterWho(!v || v === "all" ? "" : v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Initiator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Anyone</SelectItem>
              <SelectItem value="ME">Me</SelectItem>
              <SelectItem value="PARTNER">Partner</SelectItem>
              <SelectItem value="MUTUAL">Mutual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground">
          <p className="text-3xl mb-2">🌊</p>
          <p className="text-sm">Nothing found.</p>
        </div>
      ) : (
        <div className="space-y-6 pb-4">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {month} · {items.length}
              </p>
              <div className="space-y-3">
                {items.map((c) => (
                  <ConflictCard
                    key={c.id}
                    conflict={c}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
