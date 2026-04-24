import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { RegisterData } from "../../services/api";

interface RegisterFormProps {
    onSwitchToLogin: () => void;
    onSuccess: () => void;
}

export function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
    const { register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<RegisterData>({
        first_Name: "",
        last_Name: "",
        email: "",
        adres_Miasto: "",
        adres_Ulica_1: "",
        adres_Ulica_2: "",
        adres_Budynek: "",
        adres_Pokoj: "",
        adres_KodPocztowy: "",
        phone_Number: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Hasła nie są identyczne!");
            return;
        }

        setIsLoading(true);

        try {
            const success = await register(formData);
            if (success) {
                onSuccess();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Rejestracja</CardTitle>
                <CardDescription>Utwórz nowe konto w systemie</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_Name">Imię *</Label>
                            <Input
                                id="first_Name"
                                name="first_Name"
                                value={formData.first_Name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_Name">Nazwisko *</Label>
                            <Input
                                id="last_Name"
                                name="last_Name"
                                value={formData.last_Name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone_Number">Telefon *</Label>
                            <Input
                                id="phone_Number"
                                name="phone_Number"
                                value={formData.phone_Number}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="adres_Miasto">Miasto *</Label>
                            <Input
                                id="adres_Miasto"
                                name="adres_Miasto"
                                value={formData.adres_Miasto}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground">Adres</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="adres_Ulica_1">Ulica *</Label>
                                <Input
                                    id="adres_Ulica_1"
                                    name="adres_Ulica_1"
                                    value={formData.adres_Ulica_1}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="adres_Budynek">Budynek *</Label>
                                <Input
                                    id="adres_Budynek"
                                    name="adres_Budynek"
                                    value={formData.adres_Budynek}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="adres_Ulica_2">Ulica 2 (opcjonalnie)</Label>
                                <Input
                                    id="adres_Ulica_2"
                                    name="adres_Ulica_2"
                                    value={formData.adres_Ulica_2}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="adres_Pokoj">Pokój (opcjonalnie)</Label>
                                <Input
                                    id="adres_Pokoj"
                                    name="adres_Pokoj"
                                    value={formData.adres_Pokoj}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="adres_KodPocztowy">Kod pocztowy *</Label>
                                <Input
                                    id="adres_KodPocztowy"
                                    name="adres_KodPocztowy"
                                    value={formData.adres_KodPocztowy}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Hasło *</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Powtórz hasło *</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Rejestracja..." : "Zarejestruj się"}
                    </Button>
                    <Button variant="link" onClick={onSwitchToLogin} type="button">
                        Masz już konto? Zaloguj się
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}