const API_BASE_URL = 'http://localhost:5000/api';

// --- INTERFACES ---
export interface ApiUser {
    user_ID: string;
    first_Name: string;
    last_Name: string;
    email: string;
    phone_Number?: string;
    role?: string;
}

export interface RegisterData {
    first_Name: string;
    last_Name: string;
    email: string;
    adres_Miasto: string;
    adres_Ulica_1: string;
    adres_Ulica_2?: string;
    adres_Budynek: string;
    adres_Pokoj?: string;
    adres_KodPocztowy: string;
    phone_Number: string;
    password: string;
    confirmPassword: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user: ApiUser;
    token: string;
}

export interface ApiObject {
    object_ID: string;
    name: string;
    rate: number;
    description: string;
    adres_Miasto: string;
    adres_Ulica_1: string;
    adres_Ulica_2?: string;
    adres_Budynek: string;
    adres_Pokoj?: string;
    adres_KodPocztowy: string;
    phone_Number: string;
    owner_ID: string;
    tagList: string[];
    roomsList?: Room[];
    rentObjectRooms: ApiRoom[];
    facilities?: string[];
}

export interface Room {
    name: string;
    adres_Ulica_1: string;
    adres_Ulica_2?: string;
    adres_Budynek: string;
    adres_Pokoj?: string;
    adres_KodPocztowy: string;
}

export interface ApiRoom {
    rent_Object_Room_ID: string;
    room_Name: string;
    room_Capacity?: number;
}

// === RESERVATION INTERFACES ===
export interface CreateReservationRequest {
    rentObjectRoomId: string;
    userId: string;
    reservationDate_Time: string;
}

export interface CreateReservationResponse {
    success: boolean;
    message: string;
    reservationId?: string;
}

// === PAYMENT INTERFACES ===
export interface MakePaymentRequest {
    reservation_ID: string;
    amount: number;
}

export interface PaymentResponse {
    success: boolean;
    message: string;
}

export interface PaymentInfo {
    payment_ID: string;
    reservation_ID: string;
    amount: number;
    payment_Date: string;
    status: string;
}

export interface PaymentQueryParams {
    userId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

// === SLOT INTERFACES ===
export interface AllowedSlot {
    time_span: string;
    isAllowed: boolean;
}

export interface AllowedSlotsRequest {
    date: string;
    rentObjectRoomId: string;
}

// --- AUTH FUNCTIONS ---
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
    const dataToSend = { ...data, adres_Ulica_2: data.adres_Ulica_2 || "", adres_Pokoj: data.adres_Pokoj || "" };
    const res = await fetch(`${API_BASE_URL}/User/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(dataToSend)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/User/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

// --- RENT OBJECT FUNCTIONS ---
export const createObject = async (formData: any, facilities: string[], user: ApiUser, token: string): Promise<ApiObject[]> => {
    if (!token) throw new Error("Brak tokenu autoryzacyjnego");

    const dataToSend = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        icon: formData.icon,
        default_Time: formData.duration,
        pay_for_Hour: formData.pricePerHour,
        frontEnd_Color: formData.color[0] || "b",
        adres_Miasto: formData.city,
        // KLUCZOWE: Serwer wymaga Phone_Number. Jeśli user go nie ma, używamy wartości z formularza lub domyślnej.
        phone_Number: user.phone_Number || formData.phone_Number || "000000000",
        owner_ID: user.user_ID,
        roomsList: facilities.map((facilityName) => ({
            name: facilityName,
            adres_Ulica_1: formData.adres_Ulica_1,
            adres_Ulica_2: formData.adres_Ulica_2?.trim() || "brak",
            adres_Budynek: formData.adres_Budynek,
            adres_Pokoj: formData.adres_Pokoj?.trim() || "brak",
            adres_KodPocztowy: formData.adres_KodPocztowy
        })),
        tagList: [formData.category || "other"]
    };

    const res = await fetch(`${API_BASE_URL}/Rent_Object/create-rent_object`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(dataToSend)
    });

    // Sprawdzamy surowy tekst odpowiedzi
    const responseData = await res.json();
    console.log("ODPOWIEDŹ SERWERA PRZY TWORZENIU:", responseData);

    if (!res.ok || (responseData.success === false)) {
        throw new Error(responseData.message || "Serwer odrzucił żądanie utworzenia obiektu.");
    }

    // Czekamy sekundę, aby baza danych na pewno zdążyła zapisać rekord (ważne przy SQL Express/LocalDB)
    await new Promise(resolve => setTimeout(resolve, 1000));

    return await getRentObjects(token);
};

export const getRentObjects = async (token: string, limit = 50, offset = 0): Promise<ApiObject[]> => {
    const res = await fetch(`${API_BASE_URL}/Rent_Object/RentObjectWithLimit?limit=${limit}&offset=${offset}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(await res.text());

    const data: any[] = await res.json();
    console.log("🔵 Данные с сервера:", data); // Проверь это в консоли!

    return data.map(obj => {
        // Проверяем, как бэкенд назвал поле: roomList или roomsList
        const rawRooms = obj.roomList || obj.roomsList || [];

        return {
            ...obj,
            // Наполняем оба поля на всякий случай, чтобы фронтенд точно увидел
            object_ID: obj.object_ID || obj.id,
            rentObjectRooms: rawRooms.map((r: any) => ({
                rent_Object_Room_ID: r.rent_Object_Room_ID || r.id,
                room_Name: r.name_Object_Room || r.name || "Pokój"
            })),
            facilities: rawRooms.map((r: any) => r.name_Object_Room || r.name || "Udogodnienie"),
            roomsList: rawRooms
        };
    });
};

export const getObjectById = async (id: string): Promise<ApiObject> => {
    const res = await fetch(`${API_BASE_URL}/Rent_Object/RentObjectByID?RentObjID=${id}`, {
        headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getObjectsByTags = async (tags: string[]): Promise<ApiObject[]> => {
    const queryString = tags.map(tag => `tag=${encodeURIComponent(tag)}`).join('&');
    const res = await fetch(`${API_BASE_URL}/Object/objects-by-tags?${queryString}`, {
        headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const searchObjects = async (searchParams: any): Promise<ApiObject[]> => {
    const res = await fetch(`${API_BASE_URL}/Rent_Object/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchParams)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

// --- RESERVATION FUNCTIONS ---
export const createReservation = async (data: CreateReservationRequest, token: string): Promise<CreateReservationResponse> => {
    const res = await fetch(`${API_BASE_URL}/Reservation/create-reservation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getRoomDetailsById = async (roomId: string, token: string) => {
    const res = await fetch(`${API_BASE_URL}/Rent_Object/RentObjectRoomByID?RentObjRoomID=${roomId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Błąd pobierania szczegółów pokoju');
    return await res.json();
};

export const getUserReservations = async (userId: string, token: string) => {
    const res = await fetch(`${API_BASE_URL}/Reservation/ReservationByUserID?UserId=${userId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getReservationById = async (reservationId: string, token: string) => {
    const res = await fetch(`${API_BASE_URL}/Reservation/ReservationByID?reservationId=${reservationId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const cancelReservation = async (reservationId: string, token: string): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/Reservation/cancel-reservation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reservationId })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

// --- PAYMENT FUNCTIONS ---
export const makePayment = async (data: MakePaymentRequest, token: string): Promise<PaymentResponse> => {
    const res = await fetch(`${API_BASE_URL}/Payment/make-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getPaymentById = async (paymentId: string, token: string): Promise<PaymentInfo> => {
    const res = await fetch(`${API_BASE_URL}/Payment/get-payment-by-id?id=${paymentId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getPaymentsByReservationId = async (reservationId: string, token: string): Promise<PaymentInfo[]> => {
    const res = await fetch(`${API_BASE_URL}/Payment/get-payments-by-reservation-id?reservationId=${reservationId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const queryPayments = async (params: PaymentQueryParams, token: string): Promise<PaymentInfo[]> => {
    const res = await fetch(`${API_BASE_URL}/Payment/query-payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

// --- SLOT FUNCTIONS ---
export const getAllowedSlots = async (data: AllowedSlotsRequest, token: string): Promise<AllowedSlot[]> => {
    const res = await fetch(`${API_BASE_URL}/Reservation/AllowedSlotsByRoomIdAndDateDay`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}; 