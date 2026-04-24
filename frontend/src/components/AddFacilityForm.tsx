import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { createObject, ApiObject } from "../services/api";
import { POLISH_CITIES } from "../data/activities"; // jeśli plik activities.ts jest w data folder

// Safe SVG icon
const InfoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);

interface AddFacilityFormProps {
    onSuccess: (objects: ApiObject[]) => void;
    onCancel: () => void;
}

export function AddFacilityForm({ onSuccess, onCancel }: AddFacilityFormProps) {
    const { user, token } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        category: "courts",
        icon: "🏟️",
        description: "",
        duration: 60,
        pricePerHour: 0,
        color: "blue",
        city: "Warszawa",
        adres_Ulica_1: "",
        adres_Ulica_2: "",
        adres_Budynek: "",
        adres_Pokoj: "",
        adres_KodPocztowy: ""
    });

    const [facilityInput, setFacilityInput] = useState("");
    const [facilities, setFacilities] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "duration" || name === "pricePerHour" ? Number(value) : value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addFacility = () => {
        if (facilityInput.trim()) {
            setFacilities(prev => [...prev, facilityInput.trim()]);
            setFacilityInput("");
        }
    };

    const removeFacility = (index: number) => {
        setFacilities(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !token) return toast.error("Musisz być zalogowany!");

        if (!formData.name || !formData.description || facilities.length === 0) {
            return toast.error("Uzupełnij wszystkie wymagane pola!");
        }

        try {
            // Tworzymy obiekt na backendzie
            const updatedObjects = await createObject(formData, facilities, user, token);

            // 🔹 Naprawa: upewniamy się, że każde 'facilities' istnieje
            const safeObjects = updatedObjects.map(obj => ({
                ...obj,
                facilities: obj.facilities || [], // jeśli undefined → pusty array
            }));

            toast.success("Obiekt został dodany pomyślnie!");
            onSuccess(safeObjects); // teraz frontend już nie będzie crashował

        } catch (err: any) {
            console.error("Błąd przy dodawaniu obiektu:", err);
            toast.error(`Nie udało się dodać obiektu: ${err.message || err}`);
        }
    };


    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Dodaj nowy obiekt</CardTitle>
                <CardDescription>Wypełnij formularz, aby opublikować swoją ofertę</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    {/* Nazwa + Kategoria */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nazwa <span className="text-red-500">*</span></Label>
                            <Input id="name" name="name" placeholder="np. Joga, Kręgle" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="category">Kategoria</Label>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="cursor-help">
                                            <InfoIcon className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Wybierz kategorię najlepiej opisującą Twój obiekt:</p>
                                        <ul className="list-disc ml-4 text-xs mt-1">
                                            <li>Korty - tenis, squash, badminton</li>
                                            <li>Taniec - sale taneczne, fitness</li>
                                            <li>Publiczne - orliki, obiekty miejskie</li>
                                        </ul>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Select value={formData.category} onValueChange={(val) => handleSelectChange("category", val)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="courts">Korty i Sporty Rakietowe</SelectItem>
                                    <SelectItem value="dance">Taniec i Ruch</SelectItem>
                                    <SelectItem value="public">Publiczne / Społeczne</SelectItem>
                                    <SelectItem value="other">Inne</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Opis */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Opis <span className="text-red-500">*</span></Label>
                        <Input id="description" name="description" placeholder="Krótki opis oferty..." value={formData.description} onChange={handleChange} required />
                    </div>

                    {/* Ikona, Czas, Cena */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="icon">Ikona (Emoji)</Label>
                            <Input id="icon" name="icon" placeholder="np. 🏟️" value={formData.icon} onChange={handleChange} maxLength={2} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Czas (min)</Label>
                            <Input id="duration" name="duration" type="number" min="15" step="15" value={formData.duration} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pricePerHour">Cena za godzinę (zł)</Label>
                            <Input id="pricePerHour" name="pricePerHour" type="number" min="0" value={formData.pricePerHour} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Miasto + Kolor */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">Miasto <span className="text-red-500">*</span></Label>
                            <Select value={formData.city} onValueChange={(val) => handleSelectChange("city", val)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {POLISH_CITIES.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="color">Kolor motywu</Label>
                            <Select value={formData.color} onValueChange={(val) => handleSelectChange("color", val)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="blue">Niebieski</SelectItem>
                                    <SelectItem value="green">Zielony</SelectItem>
                                    <SelectItem value="red">Czerwony</SelectItem>
                                    <SelectItem value="orange">Pomarańczowy</SelectItem>
                                    <SelectItem value="purple">Fioletowy</SelectItem>
                                    <SelectItem value="pink">Różowy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Adres */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="adres_Ulica_1">Ulica <span className="text-red-500">*</span></Label>
                            <Input id="adres_Ulica_1" name="adres_Ulica_1" value={formData.adres_Ulica_1} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="adres_Budynek">Budynek <span className="text-red-500">*</span></Label>
                            <Input id="adres_Budynek" name="adres_Budynek" value={formData.adres_Budynek} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="adres_KodPocztowy">Kod pocztowy <span className="text-red-500">*</span></Label>
                            <Input id="adres_KodPocztowy" name="adres_KodPocztowy" value={formData.adres_KodPocztowy} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="adres_Pokoj">Pokój</Label>
                            <Input id="adres_Pokoj" name="adres_Pokoj" value={formData.adres_Pokoj} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Sale / korty */}
                    <div className="space-y-4 pt-4 border-t">
                        <Label>Dostępne sale / korty</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="np. Sala Główna"
                                value={facilityInput}
                                onChange={(e) => setFacilityInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFacility(); } }}
                            />
                            <Button type="button" onClick={addFacility} variant="secondary"><Plus className="w-4 h-4" /></Button>
                        </div>
                        {facilities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {facilities.map((facility, index) => (
                                    <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        {facility}
                                        <button type="button" onClick={() => removeFacility(index)} className="hover:text-destructive">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="ghost" onClick={onCancel}>Anuluj</Button>
                    <Button type="submit">Opublikuj obiekt</Button>
                </CardFooter>
            </form>
        </Card>
    );
}
