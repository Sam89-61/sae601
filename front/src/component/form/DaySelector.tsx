// @ts-nocheck
import React from 'react';
import { useTranslation } from 'react-i18next';

const DaySelector = ({
    title,
    dayOptions,
    selectedDays,
    requiredCount,
    onToggle,
    dayUnitLabel
}) => {
    const { t } = useTranslation();
    const isValid = selectedDays.length >= requiredCount;
    const remaining = requiredCount - selectedDays.length;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">{title}</h2>

            {/* Status banner */}
            <div className={`text-center p-3 rounded-lg ${
                isValid ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
            }`}>
                <p className="font-semibold">
                    {t('profile.trainingGoal', { count: requiredCount, unit: dayUnitLabel(requiredCount) })}
                </p>
                <p>
                    {t('profile.trainingSelected', { count: selectedDays.length, unit: dayUnitLabel(selectedDays.length) })}
                </p>
            </div>

            {/* Day options */}
            <div className="grid grid-cols-1 gap-3">
                {dayOptions.map(option => (
                    <label
                        key={option.value}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedDays.includes(option.value)
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                    >
                        <input
                            type="checkbox"
                            value={option.value}
                            checked={selectedDays.includes(option.value)}
                            onChange={onToggle}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-lg font-medium text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>

            {/* Warning message */}
            {!isValid && (
                <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-lg">
                    {t('profile.trainingWarning', { count: remaining, unit: dayUnitLabel(remaining) })}
                </p>
            )}
        </div>
    );
};

export default DaySelector;
