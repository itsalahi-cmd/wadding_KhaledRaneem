import { NextResponse } from 'next/server';
import { markGuestScanned } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { ticket_id } = await request.json();
    if (!ticket_id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const guest = await markGuestScanned(ticket_id);
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found or invalid ticket' }, { status: 404 });
    }

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error('Scan Error:', error);
    return NextResponse.json({ error: 'Failed to process scan' }, { status: 500 });
  }
}
