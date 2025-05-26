import React, { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/components/ConfirmationModal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}) => {
  const { t } = useLanguage(); // Get translation function
  
  // Use useCallback to prevent recreating functions on each render
  const handleConfirmClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from reaching overlay
    console.log('[ConfirmationModal] Confirm button clicked with isolated handler');
    // Call onConfirm directly without nesting in setTimeout
    onConfirm();
  }, [onConfirm]);

  const handleCancelClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[ConfirmationModal] Cancel button clicked with isolated handler');
    onCancel();
  }, [onCancel]);

  // Prevent clicks on modal content from closing it
  const handleModalContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Handle overlay click
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    // Only handle clicks directly on the overlay, not on children
    if (e.target === e.currentTarget) {
      console.log('[ConfirmationModal] Overlay clicked - cancelling');
      onCancel();
    }
  }, [onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="confirmation-modal-overlay"
      onClick={handleOverlayClick}
      data-testid="modal-overlay"
    >
      <div
        className="confirmation-modal"
        onClick={handleModalContentClick}
        data-testid="modal-content"
      >
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirmation-modal-actions">
          <button
            type="button"
            onClick={handleCancelClick}
            className="cancel-button"
            data-testid="cancel-button"
          >
            {cancelText || t('app.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            className="confirm-button"
            data-testid="confirm-button"
          >
            {confirmText || t('app.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
