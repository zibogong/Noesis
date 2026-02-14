import { NextResponse } from "next/server";
import type { ErrorResponse } from "./types";

export function errorResponse(
  detail: string,
  status: number
): NextResponse<ErrorResponse> {
  return NextResponse.json({ detail }, { status });
}
