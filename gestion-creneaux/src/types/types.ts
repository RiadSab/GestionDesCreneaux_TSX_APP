export {};
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: number;
  name: string;
}

export interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  spaceName: string;
}

export interface Booking {
  id: number;
  userId: number;
  title: string;
  description: string;
  userName: string;
  userEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  spaceName: string;
  status: string;
  user: User;
  room: {
    id: number;
    name: string;
  };
}

export interface UserSettings {
  account: {
    name: string;
    email: string;
  };
  notifications: {
    email: boolean;
    browser: boolean;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginPageProps {
  onLogin: (user: Partial<User>) => void;
}

export interface SignupData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface MyBookingsProps {
  currentUser: Partial<User>;
}

export interface DashboardProps {
  currentUser: Partial<User>;
}

export interface AvailableSlotsProps {
  currentUser: Partial<User>;
}

export interface ProfilePageProps {
  currentUser: Partial<User>;
}

export interface SettingsPageProps {
  currentUser: Partial<User>;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

export interface ReservationCalendarProps {
  currentUser: Partial<User>;
  onBookingComplete?: (booking: Booking) => void;
}

export interface NavbarProps {
  userName?: string;
  onLogout: () => void;
}

export interface RoomDTO {
  id: number;
  roomLetter: string;
  roomNumber: number;
}

export interface GetAllRoomsResponse {
  rooms?: RoomDTO[];
  message?: string;
}

export interface ReservationRequestData {
  startTime: string;
  roomId: number;
  userId: number;
}

export interface ReserveSlotsResponse {
  message: string;
}

export interface LoginResponse {
  message: string;
  userId: number;
  email: string;
  userName: string;
  token: string;
}

export interface OwnerInfo {
  id: number;
  userName: string;
  email: string;
}

export interface RoomInfoForBooking {
  id: number;
  roomLetter: string;
  roomNumber: number;
  roomName: string;
  capacity: number;
}

export interface ReservationId {
  id: number;
}

export interface UserBookingSlot {
  id: number;
  startTime: string;
  endTime: string;
  duration: number;
  reserved: boolean;
  room: RoomInfoForBooking;
  owner: OwnerInfo;
  reservation: ReservationId;
}

export interface MySlotsResponse {
  slots: UserBookingSlot[];
}
