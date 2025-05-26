import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '../types/types';
import { setAuthToken } from '../services/apiService'; // Importer setAuthToken

interface AuthContextType {
  user: Partial<User> | null;
  token: string | null; // Ajouter token ici
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: Partial<User>, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [token, setToken] = useState<string | null>(null); // État pour le token
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check localStorage for saved user data or token
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('authToken'); // Récupérer le token

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        if (savedToken) {
          setToken(savedToken);
          setAuthToken(savedToken); // Configurer l'en-tête Axios au chargement
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
        setAuthToken(null); // Nettoyer l'en-tête Axios
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData: Partial<User>, newToken: string) => {
    // La gestion de isLoading pour l'appel API est faite dans LoginPage
    // Cette fonction met à jour l'état après une connexion réussie
    setUser(userData);
    setToken(newToken); // Mettre à jour l'état du token
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', newToken); // Stocker le nouveau token
    setAuthToken(newToken); // Configurer l'en-tête Axios lors de la connexion
  };

  const logout = () => {
    setUser(null);
    setToken(null); // Nettoyer l'état du token
    localStorage.removeItem('user');
    localStorage.removeItem('authToken'); // Supprimer le token du localStorage
    setAuthToken(null); // Nettoyer l'en-tête Axios lors de la déconnexion
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const value = {
    user,
    token, // Exposer le token
    isAuthenticated: !!user && !!token, // L'authentification dépend de l'utilisateur et du token
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
