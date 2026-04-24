import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface LoginFormProps {
    onSwitchToRegister: () => void;
    onSuccess: () => void;
}

export function LoginForm({ onSwitchToRegister, onSuccess }: LoginFormProps) {
    const [view, setView] = useState<'login' | 'forgot'>('login');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const success = await login(email, password);
            if (success) {
                onSuccess();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock password reset
        toast.success(`Link do resetowania hasła został wysłany na adres ${email}`);
        setView('login');
    };

    if (view === 'forgot') {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Resetowanie hasła</CardTitle>
                    <CardDescription>Podaj swój adres email, aby otrzymać link do zmiany hasła.</CardDescription>
                </CardHeader>
                <form onSubmit={handleForgotSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="jan@kowalski.pl"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full">Wyślij link</Button>
                        <Button variant="ghost" onClick={() => setView('login')} type="button" className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Powrót do logowania
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Logowanie</CardTitle>
                <CardDescription>Zaloguj się, aby zarządzać rezerwacjami</CardDescription>
            </CardHeader>
            <form onSubmit={handleLoginSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="jan@kowalski.pl"
                                className="pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Hasło</Label>
                            <Button
                                variant="link"
                                className="px-0 font-normal text-xs h-auto"
                                type="button"
                                onClick={() => setView('forgot')}
                            >
                                Zapomniałeś hasła?
                            </Button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                className="pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Logowanie..." : "Zaloguj się"}
                    </Button>
                    <Button variant="link" onClick={onSwitchToRegister} type="button">
                        Nie masz konta? Zarejestruj się
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}