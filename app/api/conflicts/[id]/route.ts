import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getConflict(id: string, userId: string) {
  return prisma.conflict.findFirst({ where: { id, userId } });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const conflict = await getConflict(id, session.user.id);
  if (!conflict) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(conflict);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await getConflict(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, whoStarted, date, category, severity, outcome, notes, duration, moodAfter } = body;

  const updated = await prisma.conflict.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(whoStarted && { whoStarted }),
      ...(date && { date: new Date(date) }),
      category: category || null,
      severity: severity ? parseInt(severity) : null,
      outcome: outcome || null,
      notes: notes || null,
      duration: duration ? parseInt(duration) : null,
      moodAfter: moodAfter || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await getConflict(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.conflict.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
