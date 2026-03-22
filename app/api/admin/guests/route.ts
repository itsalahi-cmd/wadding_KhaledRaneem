import { NextResponse } from 'next/server';
import { getGuests, deleteGuest, updateGuestCompanionCount } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guests = await getGuests();
    // Sort by created_at descending
    guests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ guests });
  } catch (error) {
    console.error('Admin Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await deleteGuest(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, companion_count } = await request.json();
    if (!id || companion_count === undefined) {
      return NextResponse.json({ error: 'ID and companion_count are required' }, { status: 400 });
    }
    await updateGuestCompanionCount(id, companion_count);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Update Error:', error);
    return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 });
  }
}
