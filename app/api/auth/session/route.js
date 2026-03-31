import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/userSession";

export async function GET(request) {
  const session = await getUserSession(request);

  return NextResponse.json({
    authenticated: Boolean(session?.user),
    user: session?.user ?? null,
  });
}
