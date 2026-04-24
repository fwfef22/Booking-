import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserReservations, getRoomDetailsById, cancelReservation } from "../services/api";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Clock, MapPin, Loader2, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function MyReservations() {
    const { user, token } = useAuth();
    const [reservations, setReservations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

    const handleCancel = async (reservationId: string) => {
        if (!token) {
            toast.error("Sesja wygasła. Zaloguj się ponownie.");
            return;
        }

        const confirm = window.confirm("Czy na pewno chcesz anulować tę rezerwację?");
        if (!confirm) return;

        try {
            await cancelReservation(reservationId, token);

            // КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Используем filter вместо map, чтобы удалить элемент
            setReservations(prev => prev.filter(res => res.reservation_ID !== reservationId));

            toast.success("Rezerwacja została anulowana");
        } catch (error: any) {
            console.error("Błąd API:", error);

            if (error.status === 400 || error.message.includes("already canceled")) {
                // Если на сервере уже удалено/отменено, тоже убираем из стейта
                setReservations(prev => prev.filter(res => res.reservation_ID !== reservationId));
                toast.info("Ta rezerwacja była już anulowana.");
            } else {
                toast.error("Błąd podczas anulowania rezerwacji.");
            }
        }
    };
    useEffect(() => {
        const fetchMyData = async () => {
            if (!user?.user_ID || !token) return;

            try {
                const rawReservations = await getUserReservations(user.user_ID, token);

                const detailedReservations = await Promise.all(
                    rawReservations.map(async (res: any) => {
                        try {
                            const details = await getRoomDetailsById(res.rentObjectRoomId, token);
                            return {
                                ...res,
                                roomName: details.name_Object_Room,
                                objectName: details.name_Object,
                                address: `${details.adres_Miasto}, ${details.adres_Ulica_1}`
                            };
                        } catch (err) {
                            return { ...res, roomName: "Sala", objectName: "Obiekt" };
                        }
                    })
                );

                setReservations(detailedReservations);
            } catch (error) {
                console.error(error);
                toast.error("Nie удалось загрузить резервации");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyData();
    }, [user, token]);

    const now = new Date();

    const upcoming = reservations.filter(res => {
        const resDate = new Date(res.reservationDate);
        const isCancelled = res.status === 3 || res.status === "Canceled";
        const isFinished = res.status === 4;

        return resDate >= now && !isCancelled && !isFinished;
    });


    const past = reservations.filter(res => {
        const resDate = new Date(res.reservationDate);
        const isCancelled = res.status === 3 || res.status === "Canceled";


        return resDate < now && !isCancelled;
    });
    const displayedReservations = activeTab === "upcoming" ? upcoming : past;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-black font-medium">Ładowanie...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Moje rezerwacje</h1>
                <p className="text-black font-medium">Witaj {user?.first_Name}! Oto Twoje rezerwacje.</p>
            </div>

            {/* ВКЛАДКИ (Tabs) */}
            <div className="flex justify-center gap-2 mb-8">
                <Button
                    variant={activeTab === "upcoming" ? "default" : "outline"}
                    onClick={() => setActiveTab("upcoming")}
                    className="rounded-full px-6"
                >
                    Nadchodzące ({upcoming.length})
                </Button>
                <Button
                    variant={activeTab === "past" ? "default" : "outline"}
                    onClick={() => setActiveTab("past")}
                    className="rounded-full px-6 text-black font-medium"
                >
                    Zakończone ({past.length})
                </Button>
            </div>

            {displayedReservations.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-3xl">
                    <p className="text-black font-medium">
                        Brak {activeTab === "upcoming" ? "nadchodzących" : "zakończonych"} rezerwacji.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {displayedReservations.map((res) => (
                        <Card key={res.reservation_ID} className={`overflow-hidden border-l-4 shadow-sm transition-shadow ${activeTab === 'past' ? 'opacity-60 border-l-gray-400' : 'border-l-primary'}`}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-xl">{res.objectName}</h3>
                                        <div className="flex items-center text-black font-medium gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium">{res.roomName}</span>
                                            <span className="text-sm">— {res.address}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Badge variant="outline" className="text-[10px] font-normal py-0 px-2 text-black font-medium border-primary/20">
                                                E-mail: {user?.email}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                        <div className="flex flex-wrap gap-4 bg-muted/30 p-3 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <span className="font-bold">
                                                    {new Date(res.reservationDate).toLocaleDateString('pl-PL')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 border-l pl-4">
                                                <Clock className="w-4 h-4 text-primary" />
                                                <span className="font-bold">{res.reservationTime}</span>
                                            </div>
                                        </div>

                                        {/* Кнопка удаления только для будущих броней */}
                                        {activeTab === "upcoming" && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:bg-destructive/10 shrink-0"
                                                onClick={() => handleCancel(res.reservation_ID)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}