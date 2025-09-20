import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Simple middleware that allows all requests for demo
  return NextResponse.next({
    request,
  })
}
