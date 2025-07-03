import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginCredentials, LoginPageProps, User } from '../types/types';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/components/LoginPage.css';
import { loginUser } from '../auth/authUtils';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const { login: contextLogin } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials & { api?: string }>>({}); // Ajouter une erreur API générique
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name as keyof LoginCredentials]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!credentials.username) {
      newErrors.username = 'Username is required';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await loginUser(credentials);
      console.log('Login successful:', response);

      // Backend response now includes: message, userId, email, userName, token
      if (response && response.token && response.userId && response.userName && response.email) {
        const userData: User = {
          id: response.userId,
          name: response.userName, // Use userName from response for User.name
          email: response.email,
          // User type requires password, createdAt, updatedAt. 
          // These are not typically sent on login response.
          // Providing dummy values for required fields not in login response.
          password: '', // Not stored from login
          createdAt: new Date(), // Placeholder
          updatedAt: new Date(), // Placeholder
        };
        
        contextLogin(userData, response.token);
        onLogin(userData);
        navigate('/dashboard');
      } else {
        // This case should ideally not be hit if backend always sends all fields
        console.error('Login response missing expected fields:', response);
        setErrors({ api: 'Login failed due to unexpected server response.' });
      }

    } catch (error: any) {
      console.error('Login failed:', error);
      // Si l'erreur a une structure attendue de notre backend (ex: error.message)
      if (error && error.message) {
        setErrors({ api: error.message });
      } else {
        setErrors({ api: 'Login failed. Please try again.' });
      }
    }
    finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'input-error' : ''}`}
              placeholder="Username"
              disabled={isLoading}
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Password"
              disabled={isLoading}
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          {errors.api && (
            <div className="error-message api-error">{errors.api}</div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/forgot-password">Forgot Password?</Link>
          <p>
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
