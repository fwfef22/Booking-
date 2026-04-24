import { useState, useEffect } from "react";
//import { activities, Activity, ActivityCategory, POLISH_CITIES } from "./data/activities";
import { ActivityCard } from "./components/ActivityCard";
import { BookingForm } from "./components/BookingForm";
import { MyBookings } from "./components/MyBookings";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { UserProfile } from "./components/auth/UserProfile";
import { PartnerWithUs } from "./components/PartnerWithUs";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AddFacilityForm } from "./components/AddFacilityForm";
import { MyReservations } from "./components/MyReservations";
import kok from "./kok.png";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "./components/ui/tabs";
import { Calendar, Home, List, User, LogIn, Briefcase, PlusCircle, Search, MapPin, ArrowUpDown } from "lucide-react";
import { motion } from "motion/react";
import { Toaster } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./components/ui/select";
import { getRentObjects } from "./services/api";
import { POLISH_CITIES } from "./data/activities";

function SportBookingApp() {
    const { user, token } = useAuth();

    const [objects, setObjects] = useState<any[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState("home");
    const [authView, setAuthView] = useState<"login" | "register">("login");
    const [showAddFacility, setShowAddFacility] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState("all");
    const [sortBy, setSortBy] = useState("popular");

    // 🔥 POBIERANIE OBIEKTÓW Z BACKENDU
    const [loadingObjects, setLoadingObjects] = useState(true);

    useEffect(() => {
        if (!token) {
            setObjects([]);
            setLoadingObjects(false);
            return;
        }

        const loadObjects = async () => {
            try {
                setLoadingObjects(true);
                const data = await getRentObjects(token);
                setObjects(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingObjects(false);
            }
        };

        loadObjects();
    }, [token]);

    const handleActivitySelect = (activity: any) => {
        setSelectedActivity(activity);
        setActiveTab("book");
    };

    const handleBookingComplete = () => {
        setSelectedActivity(null);
        setActiveTab("bookings");
    };

    const handleBack = () => {
        setSelectedActivity(null);
        setActiveTab("home");
    };

    // 🔎 FILTROWANIE
    const getFilteredActivities = () => {
        let result = [...objects];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (a) =>
                    a.name?.toLowerCase().includes(q) ||
                    a.description?.toLowerCase().includes(q) ||
                    a.category?.toLowerCase().includes(q)
            );
        }

        if (selectedCity !== "all") {
            result = result.filter(
                (a) => a.adres_Miasto === selectedCity
            );
        }

        switch (sortBy) {
            case "price_asc":
                result.sort((a, b) => a.pay_for_Hour - b.pay_for_Hour);
                break;
            case "price_desc":
                result.sort((a, b) => b.pay_for_Hour - a.pay_for_Hour);
                break;
        }


        return result;
    };

    const filteredActivities = getFilteredActivities();

    const groupedActivities = {
        courts: filteredActivities.filter((a) => a.category === "courts"),
        dance: filteredActivities.filter((a) => a.category === "dance"),
        public: filteredActivities.filter((a) => a.category === "public"),
    };

    const hasResults = Object.values(groupedActivities).some(
        (group) => group.length > 0
    );

    const categoryTitles: Record<string, string> = {
        courts: "🎾 Korty i Sporty Rakietowe",
        dance: "💃 Szkoła Tańca i Ruchu",
        public: "🏠 Strefa Publiczna i Społeczna",
    };

    if (showAddFacility) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => setShowAddFacility(false)}
                    className="mb-4"
                >
                    ← Wróć
                </Button>
                <AddFacilityForm
                    onSuccess={(updatedObjects) => {
                        setObjects(updatedObjects);
                        setShowAddFacility(false);
                    }}
                    onCancel={() => setShowAddFacility(false)}
                />
            </div>
        );
    }


    return (
        <div
            className="min-h-screen"
            style={{
                backgroundImage: `url(${kok})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <Toaster position="top-center" />

            {/* Header */}
            <header className="bg-white/90 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-xl">
                                🏃
                            </div>
                            <div>
                                <h1 className="text-primary font-bold text-lg leading-tight">BookingSystem</h1>
                                <p className="text-xs text-black font-medium">
                                    System rezerwacji online
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-6 text-sm text-black font-medium mr-4">
                                <div>📞 +48 123 456 789</div>
                            </div>

                            {user ? (
                                <div className="flex items-center gap-2">
                                    {user.role === 'owner' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="hidden sm:flex gap-2 border-green-600 text-green-700 hover:bg-green-50"
                                            onClick={() => setShowAddFacility(true)}
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                            Dodaj obiekt
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2"
                                        onClick={() => setActiveTab("profile")}
                                    >
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                            {}
                                            {user?.first_Name?.[0] || 'U'}
                                        </div>
                                        <span className="hidden sm:inline font-medium">
                        {}
                                            {user?.first_Name || 'User'}
                    </span>
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => setActiveTab("profile")}
                                    className="gap-2"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span className="hidden sm:inline">Zaloguj się</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-12 overflow-x-auto">
                        <TabsTrigger value="home" className="flex items-center gap-2 min-w-fit px-2">
                            <Home className="w-4 h-4" />
                            <span className="hidden sm:inline">Start</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="book"
                            className="flex items-center gap-2 min-w-fit px-2"
                            disabled={!selectedActivity}
                        >
                            <Calendar className="w-4 h-4" />
                            <span className="hidden sm:inline">Rezerwuj</span>
                        </TabsTrigger>
                        <TabsTrigger value="bookings" className="flex items-center gap-2 min-w-fit px-2">
                            <List className="w-4 h-4" />
                            <span className="hidden sm:inline">Moje</span>
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="flex items-center gap-2 min-w-fit px-2">
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Profil</span>
                        </TabsTrigger>
                        <TabsTrigger value="partner" className="flex items-center gap-2 min-w-fit px-2">
                            <Briefcase className="w-4 h-4" />
                            <span className="hidden sm:inline">Współpraca</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Home Tab */}
                    <TabsContent value="home" className="mt-0 space-y-10">

                        {/* Search & Filters Section */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border space-y-4"
                        >
                            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-sm font-medium text-black font-medium flex items-center gap-2">
                                        <Search className="w-4 h-4" /> Czego szukasz?
                                    </label>
                                    <Input
                                        placeholder="np. Tenis, Joga..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-slate-50 border-slate-200"
                                    />
                                </div>

                                <div className="w-full md:w-64 space-y-2">
                                    <label className="text-sm font-medium text-black font-medium flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Lokalizacja
                                    </label>
                                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Wybierz miasto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Wszystkie miasta</SelectItem>
                                            {POLISH_CITIES.map((city) => (
                                                <SelectItem key={city} value={city}>{city}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-full md:w-64 space-y-2">
                                    <label className="text-sm font-medium text-black font-medium flex items-center gap-2">
                                        <ArrowUpDown className="w-4 h-4" /> Sortuj
                                    </label>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Sortowanie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="popular">Najpopularniejsze</SelectItem>
                                            <SelectItem value="price_asc">Cena: od najniższej</SelectItem>
                                            <SelectItem value="price_desc">Cena: od najwyższej</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </motion.div>

                        {/* Activities List */}
                        {hasResults ? (
                            Object.entries(groupedActivities).map(([category, categoryActivities], groupIndex) => (
                                categoryActivities.length > 0 && (
                                    <section key={category} className="space-y-6">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="h-px flex-1 bg-slate-200"></div>
                                            <h3 className="text-2xl font-semibold text-slate-700 bg-white px-4 py-2 rounded-full shadow-sm border">
                                                {categoryTitles[category]}
                                            </h3>
                                            <div className="h-px flex-1 bg-slate-200"></div>
                                        </div>

                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                                            {categoryActivities.map((activity, index) => (
                                                <motion.div
                                                    key={activity.object_ID}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <ActivityCard
                                                        activity={activity}
                                                        onSelect={() => handleActivitySelect(activity)}
                                                    />
                                                </motion.div>
                                            ))}



                                        </div>
                                    </section>
                                )
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Brak wyników</h3>
                                <p className="text-black font-medium mb-6">
                                    Nie znaleźliśmy obiektów spełniających Twoje kryteria. Spróbuj zmienić filtry.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCity("all");
                                        setSortBy("popular");
                                    }}
                                >
                                    Wyczyść filtry
                                </Button>
                            </div>
                        )}

                        {/* Features Section */}
                        {hasResults && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}

                                className="pt-12 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto border-t"
                            >
                                <div className="text-center p-6">
                                    <div className="text-4xl mb-4">⚡</div>
                                    <h3 className="mb-2 font-semibold">Szybka rezerwacja</h3>
                                    <p className="text-sm text-black font-medium">
                                        Zarezerwuj w kilka minut bez zbędnych formalności
                                    </p>
                                </div>
                                <div className="text-center p-6">
                                    <div className="text-4xl mb-4">💳</div>
                                    <h3 className="mb-2 font-semibold">Bezpieczna płatność</h3>
                                    <p className="text-sm text-black font-medium">
                                        Płać wygodnie online lub na miejscu
                                    </p>
                                </div>
                                <div className="text-center p-6">
                                    <div className="text-4xl mb-4">📱</div>
                                    <h3 className="mb-2 font-semibold">Zarządzaj rezerwacjami</h3>
                                    <p className="text-sm text-black font-medium">
                                        Przeglądaj i anuluj rezerwacje w każdej chwili
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </TabsContent>

                    {/* Booking Tab */}
                    <TabsContent value="book" className="mt-0">
                        {selectedActivity ? (
                            user ? (
                                <BookingForm
                                    activity={selectedActivity}
                                    onBack={handleBack}
                                    onComplete={handleBookingComplete}
                                />
                            ) : (
                                <div className="max-w-xl mx-auto">
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold mb-2">Wymagane logowanie</h3>
                                        <p className="text-black font-medium">
                                            Musisz być zalogowany, aby zarezerwować <strong>{selectedActivity.name}</strong>.
                                        </p>
                                    </div>
                                    {authView === "login" ? (
                                        <LoginForm
                                            onSwitchToRegister={() => setAuthView("register")}
                                            onSuccess={() => {/* Automatically re-renders because user is set */}}
                                        />
                                    ) : (
                                        <RegisterForm
                                            onSwitchToLogin={() => setAuthView("login")}
                                            onSuccess={() => {/* Automatically re-renders */}}
                                        />
                                    )}
                                    <div className="text-center mt-6">
                                        <Button variant="ghost" onClick={handleBack}>
                                            Wróć do przeglądania
                                        </Button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-black font-medium">Wybierz aktywność ze strony głównej</p>
                                <Button onClick={() => setActiveTab("home")} variant="link">Wróć na start</Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* My Bookings Tab */}
                    <TabsContent value="bookings" className="mt-0">
                        {user ? (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center mb-12"
                                >
                                    <h2 className="mb-4 text-2xl font-bold">Moje rezerwacje</h2>
                                    <p className="text-black font-medium">
                                        Witaj {user?.first_Name}! Oto Twoje nadchodzące i zakończone rezerwacje.
                                    </p>
                                </motion.div>
                                <MyReservations />
                            </>
                        ) : (
                            <div className="max-w-md mx-auto text-center py-12 bg-white rounded-xl shadow-sm border p-8">
                                <div className="text-6xl mb-6">📋</div>
                                <h3 className="text-2xl font-bold mb-4">Historia rezerwacji</h3>
                                <p className="text-black font-medium mb-8">
                                    Zaloguj się, aby zobaczyć historię swoich rezerwacji.
                                </p>
                                <Button onClick={() => setActiveTab("profile")} size="lg" className="w-full">
                                    Zaloguj się
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="mt-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-xl mx-auto"
                        >
                            {user ? (
                                <UserProfile />
                            ) : (
                                authView === "login" ? (
                                    <LoginForm
                                        onSwitchToRegister={() => setAuthView("register")}
                                        onSuccess={() => setActiveTab("home")}
                                    />
                                ) : (
                                    <RegisterForm
                                        onSwitchToLogin={() => setAuthView("login")}
                                        onSuccess={() => setActiveTab("home")}
                                    />
                                )
                            )}
                        </motion.div>
                    </TabsContent>

                    {/* Partner Tab */}
                    <TabsContent value="partner" className="mt-0">
                        <PartnerWithUs />
                    </TabsContent>
                </Tabs>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t mt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    🏃
                                </div>
                                <span className="font-bold">BookingSystem</span>
                            </div>
                            <p className="text-sm text-black font-medium">
                                Profesjonalny system rezerwacji obiektów sportowych
                            </p>
                        </div>
                        <div>
                            <h4 className="mb-4 font-semibold">Kontakt</h4>
                            <div className="space-y-2 text-sm text-black font-medium">
                                <p>ul. Sportowa 123</p>
                                <p>00-000 Szczecin</p>
                                <p>Tel: +48 123 456 789</p>
                                <p>Email: kontakt@sportbook.pl</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="mb-4 font-semibold">Godziny otwarcia</h4>
                            <div className="space-y-2 text-sm text-black font-medium">
                                <p>Poniedziałek - Piątek: 8:00 - 22:00</p>
                                <p>Sobota - Niedziela: 9:00 - 21:00</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="mb-4 font-semibold">Strefy</h4>
                            <div className="space-y-2 text-sm text-black font-medium">
                                <p>🎾 Korty tenisowe</p>
                                <p>💃 Sale taneczne</p>
                                <p>🏠 Świetlica i sale</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t mt-8 pt-8 text-center text-sm text-black font-medium">
                        <p>&copy; 2025 BookingSystem. Wszelkie prawa zastrzeżone.</p>
                        <p>by Liza & Anhelina</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <SportBookingApp />
        </AuthProvider>
    );
}