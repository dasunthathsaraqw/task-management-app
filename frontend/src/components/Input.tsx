import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, id, ...props }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="mb-5">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-gray-700 mb-1.5"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          {...props}
          className={`w-full px-3.5 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            error
              ? "border-red-400 bg-red-50 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-200"
              : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-blue-100"
          }`}
        />
        {error && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p
          className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1 animate-fade-in"
          role="alert"
        >
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
