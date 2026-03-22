import { NextResponse } from 'next/server';
import { saveGuest, Guest } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { name, attendance_status, companion_count } = await request.json();
    
    if (!name || !attendance_status) {
      return NextResponse.json({ error: 'Name and attendance status are required' }, { status: 400 });
    }

    const ticket_id = crypto.randomBytes(6).toString('hex').toUpperCase();
    const id = crypto.randomUUID();

    const newGuest: Guest = {
      id,
      name,
      attendance_status,
      companion_count: companion_count || 0,
      ticket_id,
      created_at: new Date().toISOString()
    };

    saveGuest(newGuest);

    return NextResponse.json({ success: true, ticket_id });
  } catch (error) {
    console.error('RSVP Error:', error);
    return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
  }
}
