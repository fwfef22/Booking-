import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export function UserProfile() {
    const { user, logout, updateUserRole } = useAuth();

    if (!user) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Profil użytkownika</CardTitle>
                    <CardDescription>Zaloguj się, aby zobaczyć swój profil</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Twój profil</CardTitle>
                        <CardDescription>
                            Zarządzaj swoim kontem i rezerwacjami
                        </CardDescription>
                    </div>
                    <Badge variant={user.role === 'owner' ? 'default' : 'secondary'}>
                        {user.role === 'owner' ? 'Właściciel' : 'Użytkownik'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Dane osobowe</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Imię</p>
                                <p className="font-medium">{user.first_Name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Nazwisko</p>
                                <p className="font-medium">{user.last_Name}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">ID użytkownika</p>
                                <p className="font-medium text-xs break-all">{user.user_ID}</p>
                            </div>
                        </div>
                    </div>

                    {/* Показываем дополнительные данные если они есть */}
                    {(user.phone_Number || user.adres_Miasto) && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Dodatkowe informacje</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {user.phone_Number && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Telefon</p>
                                        <p className="font-medium">{user.phone_Number}</p>
                                    </div>
                                )}
                                {user.adres_Miasto && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Miasto</p>
                                        <p className="font-medium">{user.adres_Miasto}</p>
                                    </div>
                                )}
                                {user.adres_Ulica_1 && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Ulica</p>
                                        <p className="font-medium">{user.adres_Ulica_1}</p>
                                    </div>
                                )}
                                {user.adres_Budynek && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Budynek</p>
                                        <p className="font-medium">{user.adres_Budynek}</p>
                                    </div>
                                )}
                                {user.adres_KodPocztowy && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Kod pocztowy</p>
                                        <p className="font-medium">{user.adres_KodPocztowy}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Zarządzanie kontem</h3>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={() => updateUserRole(user.role === 'owner' ? 'user' : 'owner')}
                        >
                            Zmień na {user.role === 'owner' ? 'Użytkownika' : 'Właściciela'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                // TODO: Add password change functionality
                                alert('Zmiana hasła - wkrótce dostępne!');
                            }}
                        >
                            Zmień hasło
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={logout}
                        >
                            Wyloguj się
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}