'use client';

import { CARBS_TARGET, FAT_TARGET, PROTEIN_TARGET } from '@/lib/recipes';
import { Macros } from '@/lib/types';
import { cn, toGermanNumber } from '@/lib/utils';
import React from 'react';

export default function Macronutrients({
    carbs,
    protein,
    fat,
    className,
}: Macros & { className?: string }) {
    // TODO: isWithinGoal integrieren

    // Create an array of the data to map through
    const macros = [
        {
            label: 'Kohlenhydrate',
            consumed: carbs,
            total: CARBS_TARGET,
            color: '#e0d83c',
        },
        {
            label: 'Proteine',
            consumed: protein,
            total: PROTEIN_TARGET,
            color: '#30bc29',
        },
        {
            label: 'Fette',
            consumed: fat,
            total: FAT_TARGET,
            color: '#e0423c',
        },
    ];

    return (
        <div className={cn('w-full max-w-lg', className)}>
            <div className='space-y-4'>
                {macros.map((macro) => (
                    <div key={macro.label} className='space-y-1'>
                        <div className='font-semibold'>{macro.label}</div>
                        <div className='h-8 w-full bg-zinc-100 rounded-full overflow-hidden relative'>
                            <div
                                className='h-full border-3 transition-all duration-300'
                                style={{
                                    width: `${Math.min(100, (macro.consumed / macro.total) * 100)}%`,
                                    backgroundColor: macro.color,
                                    borderRadius: '9999px',
                                }}
                            />
                            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium'>
                                {toGermanNumber(macro.consumed)}g von{' '}
                                {toGermanNumber(macro.total)}g
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
