// @ts-nocheck
import React from 'react';

const TimeStep = ({ title, name, value, onChange }) => (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">{title}</h2>
        <div className="max-w-xs mx-auto">
            <input
                type="time"
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-6 py-4 text-2xl text-center border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
        </div>
    </div>
);

export default TimeStep;
