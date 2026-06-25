import React from "react";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
}

const icons = {
  error: (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
};

const titles = {
  error: "Something went wrong",
  success: "Success",
  warning: "Warning",
  info: "Note",
};

const typeStyles = {
  error: {
    wrapper: "bg-red-50 border-red-300 text-red-800",
    iconWrapper: "bg-red-100 text-red-600",
    title: "text-red-800",
    message: "text-red-700",
    close: "text-red-400 hover:text-red-600 hover:bg-red-100",
  },
  success: {
    wrapper: "bg-green-50 border-green-300 text-green-800",
    iconWrapper: "bg-green-100 text-green-600",
    title: "text-green-800",
    message: "text-green-700",
    close: "text-green-400 hover:text-green-600 hover:bg-green-100",
  },
  warning: {
    wrapper: "bg-amber-50 border-amber-300 text-amber-800",
    iconWrapper: "bg-amber-100 text-amber-600",
    title: "text-amber-800",
    message: "text-amber-700",
    close: "text-amber-400 hover:text-amber-600 hover:bg-amber-100",
  },
  info: {
    wrapper: "bg-blue-50 border-blue-300 text-blue-800",
    iconWrapper: "bg-blue-100 text-blue-600",
    title: "text-blue-800",
    message: "text-blue-700",
    close: "text-blue-400 hover:text-blue-600 hover:bg-blue-100",
  },
};

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  message,
  onClose,
}) => {
  const s = typeStyles[type];

  return (
    <div
      className={`border rounded-xl p-4 mb-5 flex items-start gap-3 animate-fade-in ${s.wrapper}`}
      role="alert"
    >
      {/* Icon */}
      <div className={`p-1.5 rounded-lg ${s.iconWrapper}`}>
        {icons[type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${s.title}`}>{titles[type]}</p>
        <p className={`text-sm mt-0.5 leading-relaxed ${s.message}`}>{message}</p>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className={`p-1 rounded-lg transition-colors flex-shrink-0 ${s.close}`}
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
