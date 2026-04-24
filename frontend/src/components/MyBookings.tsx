import { useState, useEffect } from "react";
import { getBookingsFromStorage, cancelBooking, Booking } from "../data/activities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, Clock, MapPin, User, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

export function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = () => {
    const allBookings = getBookingsFromStorage();
    if (user) {
      // Filter by user email if logged in
      setBookings(allBookings.filter(b => b.userEmail === user.email));
    } else {
      // Should not happen normally as this component is protected, but fallback to empty or all
      setBookings([]);
    }
  };

  const handleCancelBooking = (bookingId: string, bookingName: string) => {
    cancelBooking(bookingId);
    loadBookings();
    toast.success("Rezerwacja została anulowana", {
      description: bookingName
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    
    if (filter === 'upcoming') {
      return bookingDate >= today;
    } else {
      return bookingDate < today;
    }
  }).sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return filter === 'upcoming' 
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });

  const activityIcons: Record<string, string> = {
    tennis: '🎾',
    dance: '💃',
    football: '⚽',
    squash: '🏸',
    padel: '🎾',
    dance_ballet: '🩰',
    dance_hiphop: '💃',
    community_center: '🏠',
    conference_room: '👥'
  };

  const activityGradients: Record<string, string> = {
    tennis: 'from-emerald-600 to-teal-600',
    dance: 'from-pink-600 to-rose-600',
    football: 'from-blue-600 to-indigo-600',
    squash: 'from-orange-500 to-red-500',
    padel: 'from-cyan-500 to-blue-500',
    dance_ballet: 'from-pink-500 to-rose-500',
    dance_hiphop: 'from-violet-600 to-purple-600',
    community_center: 'from-amber-500 to-yellow-600',
    conference_room: 'from-slate-600 to-gray-600'
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setFilter('upcoming')}
        >
          Nadchodzące ({bookings.filter(b => new Date(b.date) >= today).length})
        </Button>
        <Button
          variant={filter === 'past' ? 'default' : 'outline'}
          onClick={() => setFilter('past')}
        >
          Zakończone ({bookings.filter(b => new Date(b.date) < today).length})
        </Button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">
              {filter === 'upcoming' ? '📅' : '📋'}
            </div>
            <CardTitle className="mb-2">
              {filter === 'upcoming' ? 'Brak nadchodzących rezerwacji' : 'Brak zakończonych rezerwacji'}
            </CardTitle>
            <CardDescription>
              {filter === 'upcoming' 
                ? 'Zarezerwuj swoją pierwszą aktywność!' 
                : 'Tutaj pojawią się Twoje zakończone rezerwacje'}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => {
            const bookingDate = new Date(booking.date);
            const isPast = bookingDate < today;
            const icon = activityIcons[booking.activityId] || '🏃';
            const gradient = activityGradients[booking.activityId] || 'from-gray-600 to-gray-700';

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={isPast ? 'opacity-75' : ''}>
                  <div className={`h-1 bg-gradient-to-r ${gradient}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-3xl">{icon}</div>
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {booking.activityName}
                            {isPast && (
                              <Badge variant="secondary" className="text-xs">
                                Zakończone
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            ID: {booking.id}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`bg-gradient-to-r ${gradient}`}>
                        {booking.price} zł
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{booking.facility}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{bookingDate.toLocaleDateString('pl-PL', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{booking.time} ({booking.duration} min)</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{booking.userName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{booking.userEmail}</span>
                        </div>
                      </div>
                    </div>

                    {!isPast && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Anuluj rezerwację
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Czy na pewno chcesz anulować?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Ta akcja jest nieodwracalna. Twoja rezerwacja zostanie całkowicie usunięta.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Nie, zachowaj</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelBooking(booking.id, `${booking.activityName} - ${bookingDate.toLocaleDateString('pl-PL')}`)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Tak, anuluj
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
