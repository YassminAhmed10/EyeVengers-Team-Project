import React from 'react';
import Toast from './Toast';

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 10000 }}>
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ marginBottom: index < toasts.length - 1 ? '10px' : '0' }}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
