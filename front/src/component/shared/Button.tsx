import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'sport' | 'nutrition' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  onClick,
  type = 'button',
  ...props
}) => {
  // Classes de base
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]';

  // Classes selon la variante
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 focus:ring-indigo-600/30',
    sport: 'bg-sport hover:brightness-110 text-white shadow-lg shadow-sport/20 focus:ring-sport/30',
    nutrition: 'bg-nutrition hover:brightness-110 text-white shadow-lg shadow-nutrition/20 focus:ring-nutrition/30',
    secondary: 'bg-gray-600 hover:bg-gray-500 text-white shadow-lg shadow-gray-600/20 focus:ring-gray-600/30',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 focus:ring-red-600/30',
    outline: 'bg-white border-2 border-gray-200 hover:border-sport text-gray-700 hover:text-sport shadow-sm focus:ring-sport/20',
  };

  // Classes selon la taille
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  // Largeur
  const widthClass = fullWidth ? 'w-full' : '';

  // Spinner de chargement
  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${widthClass}
        ${className}
      `}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
}

export default Button;
