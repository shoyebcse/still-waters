import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const outcome = searchParams.get("outcome");
  const whoStarted = searchParams.get("whoStarted");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conflicts = await prisma.conflict.findMany({
    where: {
      userId: session.user.id,
      ...(category && { category: category as never }),
      ...(outcome && { outcome: outcome as never }),
      ...(whoStarted && { whoStarted: whoStarted as never }),
      ...(from || to
        ? {
            date: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(conflicts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, whoStarted, date, category, severity, outcome, notes, duration, moodAfter } = body;

  if (!title || !whoStarted || !date) {
    return NextResponse.json(
      { error: "Title, who started, and date are required" },
      { status: 400 }
    );
  }

  const conflict = await prisma.conflict.create({
    data: {
      userId: session.user.id,
      title,
      whoStarted,
      date: new Date(date),
      category: category || null,
      severity: severity ? parseInt(severity) : null,
      outcome: outcome || null,
      notes: notes || null,
      duration: duration ? parseInt(duration) : null,
      moodAfter: moodAfter || null,
    },
  });

  return NextResponse.json(conflict, { status: 201 });
}
