import axios from 'axios';
import { LoginCredentials, SignupData, User } from '../types/types';

export const API_URL = '/api'; // Or your actual API base URL

interface LoginResponse {
  message: string;
  userId: number;
  email: string;
  userName: string; // Now provided by backend and required
  token: string;    // Now provided by backend and required
}

interface SignupResponse {
  message: string;
  // Ajoutez d'autres champs si votre backend renvoie plus d'infos
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // Le backend attend `userName` et `password` dans l'objet RequestUserLogin
    const requestData = {
      userName: credentials.username, // Mapper `username` du frontend vers `userName` pour le backend
      password: credentials.password,
    };
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, requestData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw new Error('An unexpected error occurred during login.');
  }
};

export const signupUser = async (userData: SignupData): Promise<SignupResponse> => {
  try {
    // Le backend s'attend à un objet User avec `userName`, `email`, `password`.
    // Le type `User` dans types.ts a `name` au lieu de `userName`.
    // Nous allons mapper `userData.username` (de SignupData) vers `userName` pour le backend.
    const userToCreate = {
        userName: userData.username, // Mapper `username` de SignupData vers `userName`
        email: userData.email,
        password: userData.password,
        // Le rôle sera défini par le backend comme "user"
    };
    const response = await axios.post<SignupResponse>(`${API_URL}/users`, userToCreate);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw new Error('An unexpected error occurred during signup.');
  }
};
