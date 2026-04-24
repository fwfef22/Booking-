import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    User,
    CreditCard,
    Loader2,
    Wallet,
    Smartphone,
    CheckCircle2,
    Lock
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "./ui/badge";
import { useAuth } from "../context/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
    createReservation,
    makePayment,
    getUserReservations,
    getAllowedSlots,
    type AllowedSlot
} from "../services/api";

interface BookingFormProps {
    activity: any;
    onBack: () => void;
    onComplete: () => void;
}

export function BookingForm({ activity, onBack, onComplete }: BookingFormProps) {
    const { user, token } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedFacility, setSelectedFacility] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [tempMethod, setTempMethod] = useState<string>(""); 
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({
        cardNumber: "",
        expiry: "",
        cvv: "",
        blikCode: ""
    });

    const [slots, setSlots] = useState<AllowedSlot[]>([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);

    const [userName, setUserName] = useState(user ? `${user.first_Name} ${user.last_Name}` : "");
    const [userEmail, setUserEmail] = useState(user?.email || "");

    const facilities = activity.rentObjectRooms || [];

    useEffect(() => {
        const loadSlots = async () => {
            if (selectedDate && selectedFacility && token) {
                setFetchingSlots(true);
                try {
                    const dateCheck = new Date(selectedDate);
                    dateCheck.setHours(12, 0, 0, 0);
                    const data = await getAllowedSlots({
                        date: dateCheck.toISOString(),
                        rentObjectRoomId: selectedFacility
                    }, token);
                    setSlots(data);
                    setSelectedTime(undefined);
                } catch (error) {
                    console.error("Błąd pobierania slotów:", error);
                    toast.error("Nie udało się pobrać dostępności terminów");
                } finally {
                    setFetchingSlots(false);
                }
            }
        };
        loadSlots();
    }, [selectedDate, selectedFacility, token]);

    const getFacilityName = (id: string | undefined) => {
        if (!id) return "";
        const facility = facilities.find((f: any) => f.rent_Object_Room_ID === id);
        return facility ? (facility.room_Name || "Sala") : "Nieznany obiekt";
    };

    const handleConfirmPayment = () => {
        if (tempMethod === 'card') {
            if (paymentData.cardNumber.length < 16 || !paymentData.expiry || paymentData.cvv.length < 3) {
                toast.error("Proszę podać poprawne dane karty");
                return;
            }
        } else if (tempMethod === 'blik') {
            if (paymentData.blikCode.length !== 6) {
                toast.error("Kod BLIK musi mieć 6 cyfr");
                return;
            }
        } else {
            toast.error("Wybierz metodę płatności");
            return;
        }

        setPaymentMethod(tempMethod);
        setIsPaymentModalOpen(false);
        toast.success("Dane płatności zapisane");
    };

    useEffect(() => {
        if (user) {
            setUserName(`${user.first_Name} ${user.last_Name}`);
            setUserEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Проверки перед отправкой
        if (!user || !token) {
            toast.error("Musisz быть zalogowany");
            return;
        }

        if (!selectedDate || !selectedFacility || !selectedTime || !userName || !userEmail) {
            toast.error("Wypełnij wszystkie pola");
            return;
        }

        if (!paymentMethod) {
            toast.error("Wybierz metodę płatności");
            return;
        }

        setIsLoading(true);

        try {
            // 2. Подготовка даты и времени
            const startTime = selectedTime.split(" - ")[0];
            const [hours, minutes] = startTime.split(":");
            const reservationDateTime = new Date(selectedDate);
            reservationDateTime.setHours(Number(hours), Number(minutes), 0, 0);

            // 3. СОЗДАЕМ РЕЗЕРВАЦИЮ (один раз!)
            // Мы сохраняем ответ от сервера в переменную 'res'
            const res = await createReservation(
                {
                    rentObjectRoomId: selectedFacility,
                    userId: user.user_ID,
                    reservationDate_Time: reservationDateTime.toISOString(),
                },
                token
            );

            // 4. БЕРЕМ ID ИЗ ОТВЕТА
            // Сервер в ответе на создание сразу присылает reservationId
            const resId = res.reservationId;

            if (resId) {
                // 5. ОПЛАЧИВАЕМ конкретно эту резервацию по её ID
                await makePayment({
                    reservation_ID: String(resId),
                    amount: Number(activity.pay_for_Hour)
                }, token);

                toast.success("Zarezerwowano i opłacono pomyślnie!");
                onComplete();
            } else {
                throw new Error("Serwer nie zwrócił ID rezerwacji");
            }

        } catch (error: any) {
            console.error("❌ Błąd:", error);
            toast.error(error.message || "Wystąpił błąd podczas rezerwacji lub płatności");
        } finally {
            setIsLoading(false);
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={onBack} className="mb-6" disabled={isLoading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Powrót
            </Button>

            <Card className="overflow-hidden border-none shadow-lg">
                <CardHeader className="bg-white border-b">
                    {/* ... (Header remains the same) ... */}
                    <div className="flex items-center gap-4 mb-2">
                        <div className="text-4xl">{activity.icon || "🏢"}</div>
                        <div className="flex-1">
                            <CardTitle className="text-2xl">{activity.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.adres_Miasto}, {activity.adres_Ulica}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                            {activity.pay_for_Hour} zł/h
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (/* ... Step 1 content ... */
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div>
                                    <Label className="flex items-center gap-2 mb-3 text-base font-semibold">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        Wybierz pomieszczenie (salę)
                                    </Label>
                                    <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                                        <SelectTrigger className="w-full h-12">
                                            <SelectValue placeholder="-- Wybierz salę --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {facilities.map((f: any) => (
                                                <SelectItem key={f.rent_Object_Room_ID} value={f.rent_Object_Room_ID}>
                                                    {f.room_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="flex items-center gap-2 mb-3 text-base font-semibold">
                                        <CalendarIcon className="w-4 h-4 text-primary" />
                                        Wybierz datę
                                    </Label>
                                    <div className="flex justify-center border rounded-xl p-4 bg-slate-50">
                                        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => date < today} />
                                    </div>
                                </div>
                                <Button type="button" onClick={() => setStep(2)} disabled={!selectedDate || !selectedFacility} className="w-full h-12 text-lg font-bold">Dalej</Button>
                            </motion.div>
                        )}

                        {step === 2 && (/* ... Step 2 content ... */
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                                    <div className="text-sm font-medium">Sala: {getFacilityName(selectedFacility)}</div>
                                    <div className="text-sm text-muted-foreground">{selectedDate?.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                                </div>
                                <div>
                                    <Label className="flex items-center gap-2 mb-3 text-base font-semibold"><Clock className="w-4 h-4 text-primary" /> Wybierz godzinę</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {fetchingSlots ? <div className="col-span-full flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div> : (
                                            slots.length > 0 ? slots.map((slot) => (
                                                <Button key={slot.time_span} type="button" variant={selectedTime === slot.time_span ? "default" : "outline"} disabled={!slot.isAllowed} onClick={() => setSelectedTime(slot.time_span)} className="h-10">{slot.time_span}</Button>
                                            )) : <p className="col-span-full text-center py-4 text-muted-foreground">Brak godzin.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4"><Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">Wstecz</Button><Button type="button" onClick={() => setStep(3)} disabled={!selectedTime} className="flex-1 h-12">Dalej</Button></div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="bg-muted/50 rounded-xl p-5 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Obiekt:</span>
                                        <span className="font-semibold">{activity.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Sala:</span>
                                        <span className="font-semibold">{getFacilityName(selectedFacility)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Termin:</span>
                                        <span className="font-semibold">
                                            {selectedDate?.toLocaleDateString('pl-PL')}, {selectedTime}
                                        </span>
                                    </div>

                                    {}
                                    {paymentMethod && (
                                        <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20 transition-all animate-in fade-in slide-in-from-bottom-1">
                                            <div className="flex items-center gap-3">
                                                {paymentMethod === "card" ? <CreditCard className="w-5 h-5 text-primary" /> : <Smartphone className="w-5 h-5 text-primary" />}
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Metoda płatności</p>
                                                    <p className="text-sm font-bold text-primary">
                                                        {paymentMethod === "card" ? `Karta (**** ${paymentData.cardNumber.slice(-4)})` : "BLIK"}
                                                    </p>
                                                </div>
                                            </div>
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        </div>
                                    )}

                                    <div className="border-t pt-3 mt-3 flex justify-between items-center font-bold text-xl">
                                        <span>Suma:</span>
                                        <span className="text-primary">{activity.pay_for_Hour} zł</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            <User className="w-3 h-3" /> Dane rezerwującego
                                        </Label>
                                        <Input value={userName} disabled className="bg-gray-50" />
                                        <Input value={userEmail} disabled className="bg-gray-50" />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 h-12">
                                        Wstecz
                                    </Button>

                                    {}
                                    <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="secondary" className="flex-1 h-12">
                                                <Wallet className="w-4 h-4 mr-2" />
                                                {paymentMethod ? "Zmień dane" : "Metoda płatności"}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <Lock className="w-4 h-4" /> Dane płatności
                                                </DialogTitle>
                                            </DialogHeader>

                                            <RadioGroup value={tempMethod} onValueChange={setTempMethod} className="grid gap-4 py-4">
                                                <div className={`flex items-center space-x-2 border p-4 rounded-xl transition-all ${tempMethod === 'card' ? 'border-primary bg-primary/5' : ''}`}>
                                                    <RadioGroupItem value="card" id="card_m" />
                                                    <Label htmlFor="card_m" className="flex flex-1 items-center gap-3 cursor-pointer font-bold">
                                                        <CreditCard className="w-5 h-5 text-primary" /> Karta płatnicza
                                                    </Label>
                                                </div>

                                                <AnimatePresence>
                                                    {tempMethod === 'card' && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid gap-3 px-2 overflow-hidden">
                                                            <Input
                                                                placeholder="Numer karty (16 cyfr)"
                                                                maxLength={16}
                                                                value={paymentData.cardNumber}
                                                                onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value.replace(/\D/g, '')})}
                                                            />
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <Input
                                                                    placeholder="MM/YY"
                                                                    maxLength={5}
                                                                    value={paymentData.expiry}
                                                                    onChange={(e) => setPaymentData({...paymentData, expiry: e.target.value})}
                                                                />
                                                                <Input
                                                                    placeholder="CVV"
                                                                    maxLength={3}
                                                                    value={paymentData.cvv}
                                                                    onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value.replace(/\D/g, '')})}
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <div className={`flex items-center space-x-2 border p-4 rounded-xl transition-all ${tempMethod === 'blik' ? 'border-primary bg-primary/5' : ''}`}>
                                                    <RadioGroupItem value="blik" id="blik_m" />
                                                    <Label htmlFor="blik_m" className="flex flex-1 items-center gap-3 cursor-pointer font-bold">
                                                        <Smartphone className="w-5 h-5 text-primary" /> BLIK
                                                    </Label>
                                                </div>

                                                <AnimatePresence>
                                                    {tempMethod === 'blik' && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-2 overflow-hidden">
                                                            <Input
                                                                placeholder="Kod BLIK (6 cyfr)"
                                                                maxLength={6}
                                                                className="text-center tracking-[0.5em] font-black text-xl"
                                                                value={paymentData.blikCode}
                                                                onChange={(e) => setPaymentData({...paymentData, blikCode: e.target.value.replace(/\D/g, '')})}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </RadioGroup>

                                            <DialogFooter>
                                                <Button type="button" onClick={handleConfirmPayment} className="w-full">
                                                    Zatwierdź dane
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {}
                                    <Button type="submit" className="flex-1 h-12 font-bold" disabled={isLoading || !paymentMethod}>
                                        {isLoading ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4 mr-2" />
                                                Rezerwuję i płacę
                                            </>
                                        )}
                                    </Button>
                                </div>
                                {!paymentMethod && (
                                    <p className="text-center text-xs text-red-500 font-medium">* Musisz uzupełnić dane płatności, aby kontynuować</p>
                                )}
                            </motion.div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}