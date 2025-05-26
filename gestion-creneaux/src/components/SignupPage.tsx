import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importer useNavigate
import '../styles/components/LoginPage.css'; // Réutiliser les styles pour la cohérence
// import { User } from '../types/types'; // User n'est plus directement utilisé ici pour la création
import { signupUser } from '../auth/authUtils'; // Importer signupUser
// import { useLanguage } from '../contexts/LanguageContext'; // Importer useLanguage

// Le type SignupData est déjà défini dans src/types/types.ts, nous allons l'utiliser
import { SignupData } from '../types/types';

const SignupPage: React.FC = () => {
  // const { t } = useLanguage(); // Hook de traduction
  const navigate = useNavigate(); // Hook pour la navigation
  const [formData, setFormData] = useState<SignupData>({
    name: '', // Garder name si votre formulaire le demande, même si non envoyé directement
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<SignupData & { api?: string }>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors: Partial<SignupData & { api?: string }> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(''); // Réinitialiser le message de succès

    if (validateForm()) {
      setIsLoading(true);
      setErrors({}); // Réinitialiser les erreurs API précédentes

      // Préparer les données pour l'API (userName, email, password)
      const apiData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      try {
        const response = await signupUser(apiData as SignupData); // signupUser attend SignupData
        console.log('Signup successful:', response);
        setSuccessMessage(response.message || 'Account created successfully. Redirecting to login...');
        // Optionnel: rediriger après un court délai ou après clic sur un message
        setTimeout(() => {
          navigate('/login');
        }, 3000); // Redirige vers le login après 3 secondes
      } catch (error: any) {
        console.error('Signup failed:', error);
        if (error && error.message) {
          setErrors({ api: error.message });
        } else if (error && error.error) {
          // Cas où l'erreur est dans error.error (ex: CONFLICT)
          setErrors({ api: error.error });
        } else {
          setErrors({ api: 'Signup failed. Please try again.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Create Account</h2>

        {successMessage && (
          <div
            className="success-message"
            style={{ color: 'green', marginBottom: '15px' }}
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              placeholder="John Doe"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'input-error' : ''}`}
              placeholder="johndoe"
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              placeholder="john@example.com"
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              placeholder="••••••••"
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'input-error' : ''}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>

          {/* Affichage de l'erreur API */}
          {errors.api && (
            <div className="error-message api-error">{errors.api}</div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
