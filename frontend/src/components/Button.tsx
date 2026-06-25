import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer";

  const variantStyles = {
    primary:
      "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 dark:bg-purple-700 dark:hover:bg-purple-600 dark:focus:ring-purple-400",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus:ring-slate-500",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${
        fullWidth ? "w-full" : ""
      } ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
