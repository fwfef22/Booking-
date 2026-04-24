import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import {
    registerUser,
    loginUser,
    RegisterData,
    LoginData,
    AuthResponse
} from '../services/api';

export interface User {
    user_ID: string;
    first_Name: string;
    last_Name: string;
    email: string;
    phone_Number?: string;
    adres_Miasto?: string;
    adres_Ulica_1?: string;
    adres_Ulica_2?: string;
    adres_Budynek?: string;
    adres_Pokoj?: string;
    adres_KodPocztowy?: string;
    role: 'user' | 'owner';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: RegisterData) => Promise<boolean>;
    logout: () => void;
    updateUserRole: (role: 'user' | 'owner') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('currentUser');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);


    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const loginData: LoginData = { email, password };
            const response: AuthResponse = await loginUser(loginData);

            if (response.success) {
                const localUser: User = {
                    user_ID: response.user.user_ID,
                    first_Name: response.user.first_Name,
                    last_Name: response.user.last_Name,
                    email: response.user.email,
                    // KLUCZOWA POPRAWKA: Dodaj tę linię, aby nie gubić telefonu
                    phone_Number: response.user.phone_Number,
                    role: 'user'
                };

                setUser(localUser);
                setToken(response.token);
                localStorage.setItem('token', response.token);
                localStorage.setItem('currentUser', JSON.stringify(localUser));
                toast.success(`Witaj ponownie, ${response.user.first_Name}!`);
                return true;
            } else {
                toast.error(response.message || "Nieprawidłowy email lub hasło");
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error("Wystąpił błąd podczas logowania.");
            return false;
        }
    };

    const register = async (userData: RegisterData): Promise<boolean> => {
        try {
            console.log('Attempting registration with data:', userData);

            const response: AuthResponse = await registerUser(userData);
            console.log('API Response:', response);

            if (response.success) {
                // Сохраняем ВСЕ данные из формы + ответ API
                const localUser: User = {
                    user_ID: response.user.user_ID,
                    first_Name: response.user.first_Name,
                    last_Name: response.user.last_Name,
                    email: response.user.email,
                    // Сохраняем данные из формы регистрации
                    phone_Number: userData.phone_Number,
                    adres_Miasto: userData.adres_Miasto,
                    adres_Ulica_1: userData.adres_Ulica_1,
                    adres_Ulica_2: userData.adres_Ulica_2,
                    adres_Budynek: userData.adres_Budynek,
                    adres_Pokoj: userData.adres_Pokoj,
                    adres_KodPocztowy: userData.adres_KodPocztowy,
                    role: 'user'
                };

                setUser(localUser);
                setToken(response.token);
                localStorage.setItem('token', response.token);
                localStorage.setItem('currentUser', JSON.stringify(localUser));

                toast.success("Rejestracja przebiegła pomyślnie!");
                return true;
            } else {
                console.error('Registration failed:', response.message);
                toast.error(`Rejestracja nie powiodła się: ${response.message}`);
                return false;
            }
        } catch (error: any) {
            console.error('Registration error details:', error);
            console.error('Error message:', error.message);

            toast.error(`Błąd rejestracji: ${error.message || 'Sprawdź konsolę'}`);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        toast.info("Wylogowano pomyślnie");
    };

    const updateUserRole = (role: 'user' | 'owner') => {
        if (!user) return;

        const updatedUser = { ...user, role };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        toast.success(`Twoja rola została zmieniona na: ${role === 'owner' ? 'Właściciel' : 'Użytkownik'}`);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updateUserRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
 