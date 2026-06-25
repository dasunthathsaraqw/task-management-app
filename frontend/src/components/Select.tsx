import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5 transition-colors">
        {label}
      </label>
      <select
        {...props}
        className={`w-full px-3.5 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer ${
          error
            ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50"
            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:border-purple-400 dark:focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-900/30"
        }`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
};
