import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => {
  return (
    <div className="relative flex items-center w-full">
      {icon && <span className="absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none">{icon}</span>}
      <input
        className={`w-full bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 text-slate-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm rounded-xl py-2.5 ${
          icon ? 'pl-10' : 'pl-4'
        } pr-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all ${className}`}
        {...props}
      />
    </div>
  );
};
