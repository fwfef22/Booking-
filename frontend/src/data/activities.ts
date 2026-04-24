export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  price: number;
}

export type ActivityCategory = 'courts' | 'dance' | 'public' | 'other';

export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  icon: string;
  description: string;
  duration: number; // in minutes
  pricePerHour: number;
  color: string;
  gradient: string;
  facilities: string[];
  city: string;
  ownerEmail?: string; // To link with the user
}

export const POLISH_CITIES = [
    "Warszawa",
    "Kraków",
    "Łódź",
    "Wrocław",
    "Poznań",
    "Gdańsk",
    "Szczecin",
    "Bydgoszcz",
    "Lublin",
    "Białystok",
    "Katowice",
    "Gdynia",
    "Częstochowa",
    "Radom",
    "Toruń",
    "Sosnowiec",
    "Rzeszów",
    "Kielce",
    "Gliwice",
    "Olsztyn",
    "Zabrze",
    "Bielsko-Biała",
    "Bytom",
    "Zielona Góra",
    "Rybnik",
    "Ruda Śląska",
    "Opole",
    "Tychy",
    "Gorzów Wielkopolski",
    "Dąbrowa Górnicza",
    "Płock",
    "Elbląg",
    "Inne"
];

export const activities: Activity[] = [
  // Korty
  {
    id: 'tennis',
    name: 'Tenis Ziemny',
    category: 'courts',
    icon: '🎾',
    description: 'Zarezerwuj profesjonalny kort tenisowy. Dostępne nawierzchnie ceglane i twarde.',
    duration: 60,
    pricePerHour: 80,
    color: 'emerald',
    gradient: 'from-emerald-600 to-teal-600',
    facilities: ['Kort Centralny', 'Kort Treningowy 1', 'Kort Treningowy 2', 'Hala Tenisowa'],
    city: 'Warszawa'
  },
  {
    id: 'squash',
    name: 'Squash',
    category: 'courts',
    icon: '🏸',
    description: 'Dynamiczna gra w squasha. Nowoczesne klatki ze szklanymi ścianami.',
    duration: 60,
    pricePerHour: 60,
    color: 'orange',
    gradient: 'from-orange-500 to-red-500',
    facilities: ['Klatka A', 'Klatka B'],
    city: 'Kraków'
  },
  {
    id: 'padel',
    name: 'Padel',
    category: 'courts',
    icon: '🎾',
    description: 'Spróbuj swoich sił w padlu - połączeniu tenisa i squasha.',
    duration: 90,
    pricePerHour: 100,
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    facilities: ['Kort Padel 1', 'Kort Padel 2'],
    city: 'Wrocław'
  },
  
  // Taniec
  {
    id: 'dance_ballet',
    name: 'Sala Baletowa',
    category: 'dance',
    icon: '🩰',
    description: 'Profesjonalna sala z drążkami i lustrami, idealna do baletu i jazzu.',
    duration: 60,
    pricePerHour: 70,
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    facilities: ['Sala Lustrzana', 'Sala Kameralna'],
    city: 'Gdańsk'
  },
  {
    id: 'dance_hiphop',
    name: 'Street Dance',
    category: 'dance',
    icon: '💃',
    description: 'Przestronna sala z nagłośnieniem estradowym do tańca nowoczesnego.',
    duration: 90,
    pricePerHour: 60,
    color: 'violet',
    gradient: 'from-violet-600 to-purple-600',
    facilities: ['Studio Główne', 'Studio B'],
    city: 'Poznań'
  },

  // Miejsca publiczne
  {
    id: 'community_center',
    name: 'Świetlica',
    category: 'public',
    icon: '🏠',
    description: 'Miejsce spotkań dla lokalnej społeczności, gier planszowych i warsztatów.',
    duration: 120,
    pricePerHour: 30,
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-600',
    facilities: ['Sala Główna', 'Sala Warsztatowa'],
    city: 'Łódź'
  },
  {
    id: 'conference_room',
    name: 'Sala Zebrań',
    category: 'public',
    icon: '👥',
    description: 'Sala na spotkania rady osiedla lub zebrania organizacyjne.',
    duration: 60,
    pricePerHour: 50,
    color: 'slate',
    gradient: 'from-slate-600 to-gray-600',
    facilities: ['Sala Konferencyjna A'],
    city: 'Katowice'
  }
];

export function addActivity(activity: Activity) {
    activities.push(activity);
}

export function generateTimeSlots(date: Date, activityId: string, facility: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  
  const bookedSlots = getBookedSlotsForDate(date, activityId, facility);
  
  hours.forEach((hour) => {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    const isBooked = bookedSlots.includes(timeStr);
    
    // Find activity price
    const activity = activities.find(a => a.id === activityId);
    const price = activity ? activity.pricePerHour : 0;
    
    slots.push({
      id: `slot-${hour}`,
      time: timeStr,
      available: !isBooked,
      price: price
    });
  });
  
  return slots;
}

function getBookedSlotsForDate(date: Date, activityId: string, facility: string): string[] {
  const bookings = getBookingsFromStorage();
  const dateStr = date.toISOString().split('T')[0];
  
  return bookings
    .filter(b => b.activityId === activityId && b.facility === facility && b.date === dateStr)
    .map(b => b.time);
}

export interface Booking {
  id: string;
  activityId: string;
  activityName: string;
  facility: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export function getBookingsFromStorage(): Booking[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('sportBookings');
  return stored ? JSON.parse(stored) : [];
}

export function saveBooking(booking: Booking): void {
  const bookings = getBookingsFromStorage();
  bookings.push(booking);
  localStorage.setItem('sportBookings', JSON.stringify(bookings));
}

export function cancelBooking(bookingId: string): void {
  const bookings = getBookingsFromStorage();
  const updated = bookings.filter(b => b.id !== bookingId);
  localStorage.setItem('sportBookings', JSON.stringify(updated));
}
