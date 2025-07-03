import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components/LoginPage.css';
import { signupUser } from '../auth/authUtils';
import { SignupData } from '../types/types';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from './LoadingSpinner';

const SignupPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupData>({
    name: '',
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
      newErrors.name = t('signup.nameRequired') || 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = t('signup.usernameRequired') || 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = t('signup.emailRequired') || 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('signup.emailInvalid') || 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = t('signup.passwordRequired') || 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = t('signup.passwordTooShort') || 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.passwordMismatch') || 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (validateForm()) {
      setIsLoading(true);
      setErrors({});

      const apiData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      try {
        const response = await signupUser(apiData as SignupData);
        console.log('Signup successful:', response);
        setSuccessMessage(response.message || t('signup.successMessage') || 'Account created successfully. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        console.error('Signup failed:', error);
        if (error && error.message) {
          setErrors({ api: error.message });
        } else if (error && error.error) {
          setErrors({ api: error.error });
        } else {
          setErrors({ api: t('signup.signupFailed') || 'Signup failed. Please try again.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <LoadingSpinner />
          <p>{t('app.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{t('signup.title') || 'Create Account'}</h2>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t('signup.fullName') || 'Full Name'}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              placeholder={t('signup.fullNamePlaceholder') || 'John Doe'}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="username">{t('signup.username') || 'Username'}</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'input-error' : ''}`}
              placeholder={t('signup.usernamePlaceholder') || 'johndoe'}
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('signup.email') || 'Email'}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              placeholder={t('signup.emailPlaceholder') || 'john@example.com'}
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('signup.password') || 'Password'}</label>
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
            <label htmlFor="confirmPassword">{t('signup.confirmPassword') || 'Confirm Password'}</label>
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

          {errors.api && (
            <div className="error-message api-error">{errors.api}</div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (t('app.loading') || 'Loading...') : (t('signup.signupButton') || 'Sign Up')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {t('signup.alreadyHaveAccount') || 'Already have an account?'} <Link to="/login">{t('signup.signIn') || 'Sign in'}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
