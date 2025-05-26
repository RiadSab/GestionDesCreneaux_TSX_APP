import axios from 'axios';
import { 
  GetAllRoomsResponse, 
  ReservationRequestData, 
  ReserveSlotsResponse,
  MySlotsResponse
} from '../types/types';
import { API_URL } from '../auth/authUtils';

const apiClient = axios.create({
  baseURL: API_URL, // API_URL is '/api', proxy handles 'http://localhost:8080'
});

// let currentToken: string | null = null; // Not needed if consistently using apiClient

// Function to set the Authorization header with the JWT token for apiClient
export const setAuthToken = (token: string | null) => {
  // currentToken = token; // Not strictly needed if cancelSlot uses apiClient
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

/**
 * Récupère toutes les salles disponibles depuis le backend.
 */
export const getAllRooms = async (): Promise<GetAllRoomsResponse> => {
  try {
    const response = await apiClient.get<GetAllRoomsResponse>('/rooms');
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

/**
 * Réserve un ou plusieurs créneaux pour un utilisateur.
 * @param reservations La liste des réservations à effectuer.
 * @param userName Le nom de l'utilisateur qui effectue la réservation.
 */
export const reserveSlots = async (reservations: ReservationRequestData[], userName: string): Promise<ReserveSlotsResponse> => {
  try {
    const response = await apiClient.post<ReserveSlotsResponse>(
      `/slots/reserve?userName=${userName}`,
      reservations // Le corps de la requête est la liste des ReservationRequestData
    );
    return response.data;
  } catch (error) {
    console.error('Error reserving slots:', error);
    throw error;
  }
};

/**
 * Récupère les créneaux réservés par un utilisateur.
 * @param userName Le nom de l'utilisateur dont on veut récupérer les réservations.
 */
export const getMyBookedSlots = async (userName: string): Promise<MySlotsResponse> => {
  try {
    const response = await apiClient.get<MySlotsResponse>(`/slots/my?userName=${userName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user slots:', error);
    throw error;
  }
};

/**
 * Annule un créneau de réservation.
 * @param slotId L'ID du créneau (réservation) à annuler.
 */
export const cancelSlot = async (slotId: number): Promise<any> => {
  const path = '/slots/cancel'; 
  console.log(`[apiService] Attempting to cancel slot (reservation) with ID: ${slotId} using apiClient. POST to ${API_URL}${path}, body: ${slotId}`);

  // Pre-flight checks
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
    // apiClient.post will send slotId as the request body.
    // It will use its configured baseURL and default headers (including Authorization if set).
    const response = await apiClient.post(path, slotId, {
      headers: {
        // Explicitly set Content-Type, though Axios might infer it for a number payload.
        // This ensures the backend (Spring @RequestBody Integer) correctly deserializes the raw number.
        'Content-Type': 'application/json', 
      },
    }); 
    
    console.log('[apiService] cancelSlot successful, response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[apiService] Error canceling slot (reservation):', error);
    if (axios.isAxiosError(error)) { // More robust check for AxiosError
      console.error('[apiService] Axios error details:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
        // requestConfig: error.config, // Can be verbose
      });
    } else {
      console.error('[apiService] Non-Axios error:', error.message);
    }
    throw error; // Re-throw the error so UI can handle it
  }
};
