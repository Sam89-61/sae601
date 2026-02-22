import React from 'react';

/**
 * Composant Input réutilisable
 *
 * @param {Object} props
 * @param {string} props.label - Label de l'input
 * @param {string} props.error - Message d'erreur
 * @param {string} props.type - Type de l'input (text, email, password, etc.)
 * @param {string} props.placeholder - Placeholder
 * @param {string} props.value - Valeur de l'input
 * @param {Function} props.onChange - Fonction onChange
 * @param {boolean} props.required - Input requis
 * @param {boolean} props.disabled - Input désactivé
 * @param {string} props.className - Classes Tailwind additionnelles
 * @param {string} props.icon - Icône à afficher (optionnel)
 */
function Input({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  icon,
  ...props
}) {
  const hasError = !!error;

  const inputClasses = `
    w-full px-4 py-3 bg-gray-50 border-2 rounded-2xl
    focus:bg-white focus:ring-4 transition duration-200 outline-none
    font-medium text-text-main
    ${hasError
      ? 'border-error focus:border-error focus:ring-error/10'
      : 'border-gray-100 focus:border-sport focus:ring-sport/10'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${icon ? 'pl-12' : ''}
  `;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-bold text-gray-700 ml-1">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
      </div>

      {error && (
        <p className="text-sm text-error font-medium ml-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
