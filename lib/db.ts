import fs from 'fs';
import path from 'path';

export interface Guest {
  id: string;
  name: string;
  attendance_status: string;
  companion_count: number;
  ticket_id: string;
  created_at: string;
}

const dbPath = path.resolve(process.cwd(), 'guests.json');

export function getGuests(): Guest[] {
  if (!fs.existsSync(dbPath)) {
    return [];
  }
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

export function saveGuest(guest: Guest) {
  const guests = getGuests();
  guests.push(guest);
  fs.writeFileSync(dbPath, JSON.stringify(guests, null, 2));
}

export function deleteGuest(id: string) {
  const guests = getGuests();
  const updated = guests.filter(g => g.id !== id);
  fs.writeFileSync(dbPath, JSON.stringify(updated, null, 2));
}

export function updateGuestCompanionCount(id: string, count: number) {
  const guests = getGuests();
  const index = guests.findIndex(g => g.id === id);
  if (index !== -1) {
    guests[index].companion_count = count;
    fs.writeFileSync(dbPath, JSON.stringify(guests, null, 2));
  }
}
