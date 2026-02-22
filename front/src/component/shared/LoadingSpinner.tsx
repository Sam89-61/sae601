import React from 'react';

/**
 * Composant LoadingSpinner réutilisable
 *
 * @param {Object} props
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Taille du spinner
 * @param {string} props.color - Couleur du spinner (classe Tailwind)
 * @param {string} props.text - Texte à afficher sous le spinner
 * @param {boolean} props.fullScreen - Spinner plein écran
 */
function LoadingSpinner({
  size = 'md',
  color = 'text-sport',
  text = '',
  fullScreen = false,
}) {
  // Classes selon la taille
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg
        className={`animate-spin ${sizeClasses[size] || sizeClasses.md} ${color}`}
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

      {text && (
        <p className="text-sm font-medium text-gray-600">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
