"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import ConflictForm, { ConflictFormData } from "@/components/conflict-form";

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

const whoStartedColor: Record<string, string> = {
  ME: "bg-rose-100 text-rose-700 border-rose-200",
  PARTNER: "bg-blue-100 text-blue-700 border-blue-200",
  MUTUAL: "bg-amber-100 text-amber-700 border-amber-200",
};

const whoStartedLabel: Record<string, string> = {
  ME: "I started it",
  PARTNER: "Partner started",
  MUTUAL: "Mutual",
};

const severityDot = ["", "bg-emerald-400", "bg-lime-400", "bg-yellow-400", "bg-orange-400", "bg-rose-500"];

const categoryLabel: Record<string, string> = {
  MONEY: "Money",
  HOUSEHOLD: "Household",
  FAMILY: "Family",
  INTIMACY: "Intimacy",
  COMMUNICATION: "Communication",
  PARENTING: "Parenting",
  WORK: "Work",
  OTHER: "Other",
};

const outcomeLabel: Record<string, string> = {
  RESOLVED: "Resolved",
  UNRESOLVED: "Unresolved",
  ONGOING: "Ongoing",
  WALKED_AWAY: "Walked away",
};

const moodLabel: Record<string, string> = {
  CALM: "Calm",
  ANGRY: "Angry",
  SAD: "Sad",
  HURT: "Hurt",
  NUMB: "Numb",
  RELIEVED: "Relieved",
};

type Props = {
  conflict: Conflict;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: ConflictFormData) => Promise<void>;
};

export default function ConflictCard({ conflict, onDelete, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const initialForm: ConflictFormData = {
    title: conflict.title,
    whoStarted: conflict.whoStarted,
    date: format(new Date(conflict.date), "yyyy-MM-dd"),
    category: conflict.category || "",
    severity: conflict.severity?.toString() || "",
    outcome: conflict.outcome || "",
    notes: conflict.notes || "",
    duration: conflict.duration?.toString() || "",
    moodAfter: conflict.moodAfter || "",
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      {editing ? (
        <div>
          <p className="text-sm font-medium text-foreground mb-4">Edit entry</p>
          <ConflictForm
            initial={initialForm}
            onSubmit={async (data) => {
              await onUpdate(conflict.id, data);
              setEditing(false);
            }}
            submitLabel="Update"
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm leading-snug">{conflict.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(conflict.date), "EEE, MMM d, yyyy")}
              </p>
            </div>

            {conflict.severity && (
              <span className={`shrink-0 w-2.5 h-2.5 rounded-full mt-1 ${severityDot[conflict.severity]}`} title={`Severity ${conflict.severity}`} />
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${whoStartedColor[conflict.whoStarted]}`}>
              {whoStartedLabel[conflict.whoStarted]}
            </span>
            {conflict.category && (
              <Badge variant="secondary" className="text-[11px]">{categoryLabel[conflict.category]}</Badge>
            )}
            {conflict.outcome && (
              <Badge variant="outline" className="text-[11px]">{outcomeLabel[conflict.outcome]}</Badge>
            )}
            {conflict.moodAfter && (
              <Badge variant="outline" className="text-[11px]">{moodLabel[conflict.moodAfter]}</Badge>
            )}
          </div>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-sm text-muted-foreground">
              {conflict.duration && (
                <p>Duration: <span className="text-foreground">{conflict.duration} min</span></p>
              )}
              {conflict.notes && (
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{conflict.notes}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? "Less" : "More"}
            </button>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => { setEditing(true); setExpanded(false); }}
              >
                <Pencil size={13} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(conflict.id)}
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
