import axios from 'axios';
import { 
  GetAllRoomsResponse, 
  ReservationRequestData, 
  ReserveSlotsResponse,
  MySlotsResponse
} from '../types/types';
import { API_URL } from '../auth/authUtils';

const apiClient = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const getAllRooms = async (): Promise<GetAllRoomsResponse> => {
  try {
    const response = await apiClient.get<GetAllRoomsResponse>('/rooms');
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

export const reserveSlots = async (reservations: ReservationRequestData[], userName: string): Promise<ReserveSlotsResponse> => {
  try {
    const response = await apiClient.post<ReserveSlotsResponse>(
      `/slots/reserve?userName=${userName}`,
      reservations 
    );
    return response.data;
  } catch (error) {
    console.error('Error reserving slots:', error);
    throw error;
  }
};

export const getMyBookedSlots = async (userName: string): Promise<MySlotsResponse> => {
  try {
    const response = await apiClient.get<MySlotsResponse>(`/slots/my?userName=${userName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user slots:', error);
    throw error;
  }
};

export const cancelSlot = async (slotId: number): Promise<any> => {
  const path = '/slots/cancel'; 
  console.log(`[apiService] Attempting to cancel slot (reservation) with ID: ${slotId} using apiClient. POST to ${API_URL}${path}, body: ${slotId}`);

  if (!API_URL) {
    const errorMessage = "[apiService] CRITICAL: API_URL is undefined or empty!";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  if (!path || typeof path !== 'string' || path.trim() === '') {
     const errorMessage = `[apiService] CRITICAL: path is invalid! Path: ${path}`;
     console.error(errorMessage);
     throw new Error(errorMessage);
  }
  if (typeof slotId !== 'number' || isNaN(slotId)) {
    const errorMessage = `[apiService] CRITICAL: slotId is not a valid number! slotId: ${slotId}, type: ${typeof slotId}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    const response = await apiClient.post(path, slotId, {
      headers: {
        'Content-Type': 'application/json', 
      },
    }); 
    
    console.log('[apiService] cancelSlot successful, response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[apiService] Error canceling slot (reservation):', error);
    if (axios.isAxiosError(error)) { 
      console.error('[apiService] Axios error details:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    } else {
      console.error('[apiService] Non-Axios error:', error.message);
    }
    throw error; 
  }
};
