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
  const { t } = useLanguage();
  const handleConfirmClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
  }, [onConfirm]);
  const handleCancelClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  }, [onCancel]);
  const handleModalContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
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