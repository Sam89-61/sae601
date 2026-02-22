import React from 'react';

/**
 * Composant Card réutilisable
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu de la card
 * @param {string} props.className - Classes Tailwind additionnelles
 * @param {boolean} props.hoverable - Card avec effet hover
 * @param {Function} props.onClick - Fonction de clic
 * @param {boolean} props.noPadding - Pas de padding interne
 */
function Card({
  children,
  className = '',
  hoverable = false,
  onClick,
  noPadding = false,
  ...props
}) {
  const baseClasses = 'bg-white rounded-3xl shadow-xl border border-gray-100';
  const paddingClass = noPadding ? '' : 'p-6';
  const hoverClass = hoverable ? 'hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer' : '';
  const clickClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`
        ${baseClasses}
        ${paddingClass}
        ${hoverClass}
        ${clickClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
