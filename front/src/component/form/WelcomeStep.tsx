// @ts-nocheck
import React from 'react';

const WelcomeStep = ({ title, subtitle, buttonText, onNext }) => (
    <div className="text-center space-y-6 py-8 animate-fade-in">
        <div className="flex justify-center mb-6">
            <img src="/media/logo.svg" alt="Logo" className="h-24 w-24 object-cover" />
        </div>
        <h2 className="text-4xl font-bold text-text-main mb-4">{title}</h2>
        <p className="text-lg text-gray-600">{subtitle}</p>
        <button
            type="button"
            onClick={onNext}
            className="mt-8 bg-sport hover:brightness-110 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
            {buttonText}
        </button>
    </div>
);

export default WelcomeStep;
