import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const {
    
  } = await request.json();
  return NextResponse.json({ message: 'Hello, world!' });
}
