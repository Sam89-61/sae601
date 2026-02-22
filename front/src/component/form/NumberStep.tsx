// @ts-nocheck
import React from 'react';

const NumberStep = ({ title, name, value, onChange, min, max, unit, subtitle }) => (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">{title}</h2>
        <div className="max-w-xs mx-auto">
            <div className="relative">
                <input
                    type="number"
                    min={min}
                    max={max}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full px-6 py-4 text-2xl text-center border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-sport focus:border-transparent outline-none text-text-main"
                    placeholder={title}
                    required
                />
                {unit && <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-xl text-gray-500 font-semibold">{unit}</span>}
            </div>
            {subtitle && <p className="text-sm text-gray-500 text-center mt-2">{subtitle}</p>}
        </div>
    </div>
);

export default NumberStep;
