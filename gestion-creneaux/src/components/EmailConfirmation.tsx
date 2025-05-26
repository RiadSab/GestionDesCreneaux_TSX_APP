import React from 'react';
import { Booking, User } from '../types/types';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/components/EmailConfirmation.css';

interface EmailConfirmationProps {
  booking: Booking;
  user: Partial<User>;
  onClose: () => void;
  onSend?: () => void;
  onCancel?: () => Promise<void> | void;
  previewOnly?: boolean;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({
  booking,
  user,
  onClose,
  onSend,
  onCancel,
  previewOnly = false,
}) => {
  const { t, language } = useLanguage();

  // Define fallback translations for critical elements
  const emailTranslations = {
    en: {
      bookingConfirmed: 'Booking Confirmed',
      hello: 'Hello',
      yourBookingText:
        'Your booking has been confirmed with the following details:',
      bookingId: 'Booking ID',
      additionalInfo:
        'If you need to make any changes to your booking, please contact us.',
      addToCalendar: 'Add to Calendar',
      regards: 'Regards',
      teamName: 'The Room Booking Team',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      contact: 'Contact Us',
      title: 'Title',
      date: 'Date',
      time: 'Time',
      room: 'Room',
      description: 'Description',
      status: 'Status',
      confirmed: 'Confirmed',
      preview: 'Email Preview',
      confirmation: 'Booking Confirmation',
      send: 'Send Email',
      close: 'Close',
    },
    fr: {
      bookingConfirmed: 'Réservation Confirmée',
      hello: 'Bonjour',
      yourBookingText:
        'Votre réservation a été confirmée avec les détails suivants:',
      bookingId: 'ID de Réservation',
      additionalInfo:
        'Si vous souhaitez apporter des modifications à votre réservation, veuillez nous contacter.',
      addToCalendar: 'Ajouter au Calendrier',
      regards: 'Cordialement',
      teamName: "L'équipe de Réservation de Salles",
      terms: "Conditions d'Utilisation",
      privacy: 'Politique de Confidentialité',
      contact: 'Contactez-nous',
      title: 'Titre',
      date: 'Date',
      time: 'Heure',
      room: 'Salle',
      description: 'Description',
      status: 'Statut',
      confirmed: 'Confirmée',
      preview: "Aperçu de l'Email",
      confirmation: 'Confirmation de Réservation',
      send: "Envoyer l'Email",
      close: 'Fermer',
    },
  };

  // Enhanced translation function with fallbacks
  const translate = (key: string): string => {
    // Try the context translation first
    const contextTranslation = t(key);

    // If we get back the key itself, translation failed
    if (contextTranslation === key) {
      const keyParts = key.split('.');
      const category = keyParts[0]; // e.g., 'email', 'booking'
      const term = keyParts[1]; // e.g., 'bookingConfirmed', 'hello'

      const lang = language as 'en' | 'fr';

      // Try to get from our local fallback translations
      if (term && (category === 'email' || category === 'booking')) {
        return (
          emailTranslations[lang][term as keyof typeof emailTranslations.en] ||
          key
        );
      }

      return term || key; // Return the term part or the whole key as last resort
    }

    return contextTranslation;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="email-confirmation-overlay">
      <div className="email-confirmation-modal">
        <div className="email-confirmation-header">
          <h2>
            {previewOnly
              ? translate('email.preview')
              : translate('email.confirmation')}
          </h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="email-content">
          <div className="email-header-section">
            <div className="email-logo">
              <span className="logo-text">Room Booking</span>
            </div>
          </div>

          <div className="email-body">
            <h3>{translate('email.bookingConfirmed')}</h3>

            <p className="greeting">
              {translate('email.hello')} {user.name},
            </p>

            <p className="confirmation-message">
              {translate('email.yourBookingText')}
            </p>

            <div className="booking-details-card">
              <div className="booking-detail-row">
                <span className="detail-label">
                  {translate('booking.title')}:
                </span>
                <span className="detail-value">{booking.title}</span>
              </div>

              <div className="booking-detail-row">
                <span className="detail-label">
                  {translate('booking.date')}:
                </span>
                <span className="detail-value">{formatDate(booking.date)}</span>
              </div>

              <div className="booking-detail-row">
                <span className="detail-label">
                  {translate('booking.time')}:
                </span>
                <span className="detail-value">
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>

              <div className="booking-detail-row">
                <span className="detail-label">
                  {translate('booking.room')}:
                </span>
                <span className="detail-value">{booking.spaceName}</span>
              </div>

              {booking.description && (
                <div className="booking-detail-row">
                  <span className="detail-label">{t('booking.description')}:</span>
                  <span className="detail-value">{booking.description}</span>
                </div>
              )}

              <div className="booking-detail-row">
                <span className="detail-label">
                  {translate('booking.status')}:
                </span>
                <span className="detail-value status-confirmed">
                  {booking.status === 'confirmed'
                    ? t('status.confirmed')
                    : t('status.cancelled')}
                </span>
              </div>
            </div>

            <div className="booking-id">
              {t('booking.bookingId')}: #{booking.id}
            </div>

            <p className="additional-info">
              {t('email.additionalInfo')}
            </p>

            <div className="calendar-link">
              <a href="#" className="calendar-button">
                {translate('email.addToCalendar')}
              </a>
            </div>

            <p className="email-closing">
              {t('email.bestRegards')},
              <br />
              {t('email.roomBookingTeam')}
            </p>
          </div>

          <div className="email-footer">
            <p>© {new Date().getFullYear()} Room Booking System</p>
            <p className="footer-links">
              <a href="#">{t('footer.terms')}</a> |
              <a href="#">{t('footer.privacy')}</a> |
              <a href="#">{t('footer.contact')}</a>
            </p>
          </div>
        </div>

        <div className="email-confirmation-actions">
          {!previewOnly && onSend && (
            <button className="send-button" onClick={onSend}>
              {translate('email.send')}
            </button>
          )}
          {!previewOnly && onCancel && (
            <button className="cancel-booking-button" onClick={onCancel}>
              {t('bookings.cancelBooking')}
            </button>
          )}
          <button className="close-button-action" onClick={onClose}>
            {t('email.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
