import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow all requests to proceed
  return NextResponse.next();
}
