import React from 'react';
import clsx from 'clsx';
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import Modal from './Modal'; // Assuming Modal exists, else this requires a Modal component

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning', // danger, warning, info
  loading = false,
}) => {
  const Icon = variant === 'danger' ? FaExclamationTriangle : variant === 'info' ? FaInfoCircle : FaExclamationTriangle;
  
  const iconColors = {
    danger: 'text-red-500 bg-red-100',
    warning: 'text-amber-500 bg-amber-100',
    info: 'text-blue-500 bg-blue-100',
  };

  const btnColors = {
    danger: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
    warning: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500',
    info: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
  };

  return (
    <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} className="max-w-md">
      <div className="flex flex-col sm:flex-row gap-4 p-6">
        <div className={clsx('flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mx-auto sm:mx-0', iconColors[variant] || iconColors.warning)}>
          <Icon size={24} />
        </div>
        <div className="flex-1 text-center sm:text-left mt-3 sm:mt-0">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </div>
      <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3 rounded-b-lg">
        <button
          onClick={onConfirm}
          disabled={loading}
          className={clsx(
            'inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors w-full sm:w-auto',
            btnColors[variant] || btnColors.warning,
            loading && 'opacity-75 cursor-not-allowed'
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              Loading...
            </span>
          ) : (
            confirmLabel
          )}
        </button>
        <button
          onClick={onClose}
          disabled={loading}
          className="inline-flex justify-center w-full sm:w-auto px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          {cancelLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
