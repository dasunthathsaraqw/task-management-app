import React, { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, helpText, id, ...props }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = props.type === "password";
  const inputType = isPasswordType && showPassword ? "text" : props.type;

  return (
    <div className="mb-5">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5 transition-colors"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          {...props}
          type={inputType}
          className={`w-full px-3.5 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            isPasswordType && error ? 'pr-16' : isPasswordType || error ? 'pr-10' : ''
          } ${
            error
              ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-600 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50"
              : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-purple-400 dark:focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-900/30"
          }`}
        />
        
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 pl-2 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none transition-colors"
            tabIndex={-1}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}

        {error && (
          <div className={`absolute inset-y-0 ${isPasswordType ? 'right-9' : 'right-3'} flex items-center pointer-events-none`}>
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {helpText && !error && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">
          {helpText}
        </p>
      )}

      {error && (
        <p
          className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in"
          role="alert"
        >
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
