import { NextResponse } from 'next/server';
import { unmarkGuestScanned } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Guest ID is required' }, { status: 400 });
    }

    const guest = await unmarkGuestScanned(id);
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error('Unscan Error:', error);
    return NextResponse.json({ error: 'Failed to unscan guest' }, { status: 500 });
  }
}
