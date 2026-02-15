import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSummaryById } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const record = await getSummaryById(id, email);
  if (!record) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}
