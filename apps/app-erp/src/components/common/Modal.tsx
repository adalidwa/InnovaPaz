import React from 'react';
import { IoClose, IoWarning, IoCheckmarkCircle, IoInformationCircle } from 'react-icons/io5';
import Button from './Button';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  modalType?: 'info' | 'success' | 'warning' | 'error';
  showCloseButton?: boolean;
  confirmButtonText?: string;
  showCancelButton?: boolean;
  cancelButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  closeOnOverlayClick?: boolean;
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
  showConfirmButton?: boolean;
}

function Modal({
  isOpen,
  onClose,
  title,
  message,
  modalType = 'info',
  showCloseButton = true,
  confirmButtonText = 'Accept',
  showCancelButton = false,
  cancelButtonText = 'Cancel',
  onConfirm,
  onCancel,
  closeOnOverlayClick = true,
  size = 'medium',
  children,
  showConfirmButton = true,
}: ModalProps) {
  const getModalIcon = () => {
    const iconProps = { size: 24 };

    switch (modalType) {
      case 'success':
        return <IoCheckmarkCircle {...iconProps} className='modal-icon modal-icon-success' />;
      case 'warning':
        return <IoWarning {...iconProps} className='modal-icon modal-icon-warning' />;
      case 'error':
        return <IoWarning {...iconProps} className='modal-icon modal-icon-error' />;
      default:
        return <IoInformationCircle {...iconProps} className='modal-icon modal-icon-info' />;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (modalType) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'accent';
      default:
        return 'primary';
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='modal-overlay' onClick={handleOverlayClick}>
      <div className={`modal-content modal-content-${size} modal-${modalType}`}>
        {showCloseButton && (
          <button className='modal-close-button' onClick={onClose} type='button'>
            <IoClose size={20} />
          </button>
        )}

        <div className='modal-header'>
          {getModalIcon()}
          {title && <h3 className='modal-title'>{title}</h3>}
        </div>

        <div className='modal-body'>
          {children ? (
            <div className='modal-custom-content'>{children}</div>
          ) : (
            <>
              <p className='modal-message'>{message}</p>
              <div className='modal-actions'>
                {showConfirmButton && (
                  <Button
                    variant={getConfirmButtonVariant()}
                    onClick={handleConfirm}
                    size='medium'
                    className='modal-confirm-button'
                  >
                    {confirmButtonText}
                  </Button>
                )}
                {showCancelButton && (
                  <Button
                    variant='secondary'
                    onClick={handleCancel}
                    size='medium'
                    className='modal-cancel-button'
                  >
                    {cancelButtonText}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
