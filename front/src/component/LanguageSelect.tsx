// @ts-nocheck
import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

function LanguageSelect({ className = '' }) {
  const { t } = useTranslation();
  const currentLang = i18n.language || 'fr';

  const handleChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      <label htmlFor="language-select" className="text-sm text-gray-600">
        {t('common.language')}
      </label>
      <select
        id="language-select"
        value={currentLang}
        onChange={handleChange}
        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="fr">{t('common.french')}</option>
        <option value="en">{t('common.english')}</option>
      </select>
    </div>
  );
}

export default LanguageSelect;
