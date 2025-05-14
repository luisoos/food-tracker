'use client';

import React from 'react';

interface MacronutrientData {
  consumed: number;
  total: number;
  color: string; // CSS color value
}

interface MacronutrientsProps {
  carbs: MacronutrientData;
  protein: MacronutrientData;
  fat: MacronutrientData;
}

export default function Macronutrients({
  carbs,
  protein,
  fat
}: MacronutrientsProps) {
  // Create an array of the data to map through
  const macros = [
    { label: "Kohlenhydrate", data: carbs },
    { label: "Proteine", data: protein },
    { label: "Fette", data: fat },
  ];

  return (
    <div className="w-full max-w-md">
      <div className="space-y-4">
        {macros.map((macro) => (
          <div key={macro.label} className="space-y-1">
            <div className="font-semibold">{macro.label}</div>
            <div className="h-8 w-full bg-zinc-100 rounded-full overflow-hidden relative">
              <div 
                className="h-full border-3 border-zinc-100 transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (macro.data.consumed / macro.data.total) * 100)}%`,
                  backgroundColor: macro.data.color,
                  borderRadius: '9999px'
                }}
              />
              <div 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
              >
                {macro.data.consumed}g von {macro.data.total}g
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
