// @ts-nocheck
import React from 'react';

const RadioStep = ({ title, subtitle, options, name, value, onChange, suffix = '' }) => (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">{title}</h2>
        {subtitle && <p className="text-center text-gray-600 text-sm">{subtitle}</p>}
        <div className="grid grid-cols-1 gap-3">
            {options.map(option => {
                const optValue = typeof option === 'object' ? option.value : option;
                const optLabel = typeof option === 'object' ? option.label : option;

                return (
                    <label
                        key={optValue}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            value == optValue // "==" pour gérer string vs number
                            ? 'border-sport bg-sport/5'
                            : 'border-gray-200 hover:border-sport/30 hover:bg-gray-50'
                        }`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={optValue}
                            checked={value == optValue}
                            onChange={onChange}
                            className="w-5 h-5 text-sport focus:ring-sport"
                        />
                        <span className="ml-3 text-lg font-medium text-gray-700">{optLabel}{suffix}</span>
                    </label>
                );
            })}
        </div>
    </div>
);

export default RadioStep;
