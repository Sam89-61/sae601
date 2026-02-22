// @ts-nocheck
import React from 'react';
import { PartyPopper } from 'lucide-react';

const FinalStep = ({ title, subtitle }) => (
    <div className="text-center space-y-6 py-8 animate-fade-in">
        <PartyPopper className="w-20 h-20 mx-auto text-indigo-600" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto">{subtitle}</p>
    </div>
);

export default FinalStep;
