import axios from 'axios';
import { LoginCredentials, SignupData, User } from '../types/types';

export const API_URL = '/api';

interface LoginResponse {
  message: string;
  userId: number;
  email: string;
  userName: string;
  token: string;
}

interface SignupResponse {
  message: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const requestData = {
      userName: credentials.username,
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
    const userToCreate = {
        userName: userData.username,
        email: userData.email,
        password: userData.password,
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
