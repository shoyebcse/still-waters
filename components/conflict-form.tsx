"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export type ConflictFormData = {
  title: string;
  whoStarted: string;
  date: string;
  category: string;
  severity: string;
  outcome: string;
  notes: string;
  duration: string;
  moodAfter: string;
};

type Props = {
  initial?: Partial<ConflictFormData>;
  onSubmit: (data: ConflictFormData) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
};

const empty: ConflictFormData = {
  title: "",
  whoStarted: "",
  date: format(new Date(), "yyyy-MM-dd"),
  category: "",
  severity: "",
  outcome: "",
  notes: "",
  duration: "",
  moodAfter: "",
};

export default function ConflictForm({ initial, onSubmit, submitLabel = "Save", onCancel }: Props) {
  const [form, setForm] = useState<ConflictFormData>({ ...empty, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof ConflictFormData, value: string | null) {
    setForm((f) => ({ ...f, [field]: value ?? "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.whoStarted || !form.date) {
      setError("Title, who started, and date are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          What happened? <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Brief description of the conflict…"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </div>

      {/* Who started + Date side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>
            Who started <span className="text-destructive">*</span>
          </Label>
          <Select value={form.whoStarted} onValueChange={(v) => set("whoStarted", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ME">Me</SelectItem>
              <SelectItem value="PARTNER">Partner</SelectItem>
              <SelectItem value="MUTUAL">Mutual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Category + Severity */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Topic</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Category…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
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
        </div>

        <div className="space-y-1.5">
          <Label>Severity</Label>
          <Select value={form.severity} onValueChange={(v) => set("severity", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="1–5…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="1">1 — Very mild</SelectItem>
              <SelectItem value="2">2 — Mild</SelectItem>
              <SelectItem value="3">3 — Moderate</SelectItem>
              <SelectItem value="4">4 — Intense</SelectItem>
              <SelectItem value="5">5 — Very intense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Outcome + Mood */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Outcome</Label>
          <Select value={form.outcome} onValueChange={(v) => set("outcome", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Outcome…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="UNRESOLVED">Unresolved</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="WALKED_AWAY">Walked away</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Mood after</Label>
          <Select value={form.moodAfter} onValueChange={(v) => set("moodAfter", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Mood…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="CALM">Calm</SelectItem>
              <SelectItem value="ANGRY">Angry</SelectItem>
              <SelectItem value="SAD">Sad</SelectItem>
              <SelectItem value="HURT">Hurt</SelectItem>
              <SelectItem value="NUMB">Numb</SelectItem>
              <SelectItem value="RELIEVED">Relieved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          min={1}
          placeholder="How long did it last?"
          value={form.duration}
          onChange={(e) => set("duration", e.target.value)}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="What happened? How did you feel? What triggered it?"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
