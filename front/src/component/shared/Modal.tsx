import React, { useEffect } from 'react';
import Button from './Button';

/**
 * Composant Modal réutilisable
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal ouvert ou fermé
 * @param {Function} props.onClose - Fonction pour fermer la modal
 * @param {string} props.title - Titre de la modal
 * @param {React.ReactNode} props.children - Contenu de la modal
 * @param {React.ReactNode} props.footer - Footer personnalisé (optionnel)
 * @param {string} props.size - Taille de la modal ('sm', 'md', 'lg', 'xl')
 * @param {boolean} props.showCloseButton - Afficher le bouton de fermeture
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
}) {
  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Bloquer le scroll quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Classes selon la taille
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={`
          w-full ${sizeClasses[size] || sizeClasses.md}
          bg-white rounded-2xl shadow-2xl overflow-hidden
          animate-in slide-in-from-bottom-10 zoom-in-95 duration-300
        `}
      >
        {/* Header */}
        {title && (
          <div className="bg-sport px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook pour gérer facilement l'état d'une modal
 * @returns {[boolean, Function, Function]} [isOpen, open, close]
 */
export function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return [isOpen, open, close];
}

export default Modal;
