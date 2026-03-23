import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || '';
const redisObj = createClient({ url: redisUrl });

let isConnected = false;
async function getRedis() {
  if (!isConnected) {
    if (!redisUrl) console.warn("REDIS_URL is strictly required for production.");
    await redisObj.connect();
    isConnected = true;
  }
  return redisObj;
}

export interface Guest {
  id: string;
  name: string;
  attendance_status: string;
  companion_count: number;
  ticket_id: string;
  created_at: string;
  scanned?: boolean;
  scanned_at?: string;
}

export async function getGuests(): Promise<Guest[]> {
  try {
    const client = await getRedis();
    const data = await client.get('guests');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Redis get error:', err);
    return [];
  }
}

export async function saveGuest(guest: Guest) {
  const client = await getRedis();
  const guests = await getGuests();
  guests.push(guest);
  await client.set('guests', JSON.stringify(guests));
}

export async function deleteGuest(id: string) {
  const client = await getRedis();
  const guests = await getGuests();
  const updated = guests.filter(g => g.id !== id);
  await client.set('guests', JSON.stringify(updated));
}

export async function updateGuestCompanionCount(id: string, count: number) {
  const client = await getRedis();
  const guests = await getGuests();
  const index = guests.findIndex(g => g.id === id);
  if (index !== -1) {
    guests[index].companion_count = count;
    await client.set('guests', JSON.stringify(guests));
  }
}

export async function markGuestScanned(ticket_id: string): Promise<Guest | null> {
  const client = await getRedis();
  const guests = await getGuests();
  const index = guests.findIndex(g => g.ticket_id === ticket_id);
  if (index !== -1) {
    guests[index].scanned = true;
    guests[index].scanned_at = new Date().toISOString();
    await client.set('guests', JSON.stringify(guests));
    return guests[index];
  }
  return null;
}

export async function unmarkGuestScanned(id: string): Promise<Guest | null> {
  const client = await getRedis();
  const guests = await getGuests();
  const index = guests.findIndex(g => g.id === id);
  if (index !== -1) {
    guests[index].scanned = false;
    delete guests[index].scanned_at;
    await client.set('guests', JSON.stringify(guests));
    return guests[index];
  }
  return null;
}
