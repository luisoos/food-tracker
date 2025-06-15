import React from 'react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

interface MacroInfo {
    label: string;
    unit: string;
    description: string;
}

const MACRO_INFO: Record<'carbs' | 'protein' | 'fat', MacroInfo> = {
    carbs: {
        label: 'Kohlenhydrate',
        unit: 'g',
        description: 'Primäre Energiequelle',
    },
    protein: {
        label: 'Protein',
        unit: 'g',
        description: 'Essentiell für Muskelaufbau',
    },
    fat: {
        label: 'Fett',
        unit: 'g',
        description: 'Wichtige Nährstoffquelle',
    },
};

interface MacroHoverCardProps {
    macroType: 'carbs' | 'protein' | 'fat';
    currentAmount: number;
    targetAmount: number;
    value: number;
    additionalValue?: number;
}

function MacroHoverCard({
    macroType,
    currentAmount,
    targetAmount,
    value,
    additionalValue = 0,
}: MacroHoverCardProps) {
    const info = MACRO_INFO[macroType];

    return (
        <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold'>{info.label}</h4>
                <span className='text-xs text-zinc-600'>
                    {info.description}
                </span>
            </div>
            <div className='flex flex-col gap-1'>
                <div className='flex items-center justify-between text-sm'>
                    <span className='text-zinc-600'>Tagesziel</span>
                    <span className='font-medium'>
                        {targetAmount}
                        {info.unit}
                    </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                    <span className='text-zinc-600'>Bereits erreicht</span>
                    <span className='font-medium'>
                        {Math.round(currentAmount)}
                        {info.unit} ({Math.round(value)}%)
                    </span>
                </div>
                {additionalValue > 0 && (
                    <div className='flex items-center justify-between text-sm'>
                        <span className='text-zinc-600'>Dieses Rezept</span>
                        <span className='font-medium'>
                            +
                            {Math.round((additionalValue / 100) * targetAmount)}
                            {info.unit} (+{Math.round(additionalValue)}%)
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

interface MacroRingProps {
    value: number; // 0-100
    additionalValue?: number; // 0-100
    color: string;
    size?: number; // px
    strokeWidth?: number;
    children?: React.ReactNode;
    macroType: 'carbs' | 'protein' | 'fat';
    currentAmount: number;
    targetAmount: number;
}

export default function MacroRing({
    value,
    additionalValue = 0,
    color,
    size = 48,
    strokeWidth = 5,
    children,
    macroType,
    currentAmount,
    targetAmount,
}: MacroRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - value / 100);
    const additionalOffset =
        circumference * (1 - (value + additionalValue) / 100);

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div
                    className='relative inline-block p-0.5'
                    style={{ width: size, height: size }}>
                    <svg width={size} height={size}>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke='#eee'
                            strokeWidth={strokeWidth}
                            fill='none'
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            fill='none'
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap='round'
                            className='transition-[stroke-dashoffset] duration-500'
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        />
                        {additionalValue > 0 && (
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={color}
                                strokeWidth={strokeWidth}
                                fill='none'
                                strokeDasharray={circumference}
                                strokeDashoffset={additionalOffset}
                                strokeLinecap='round'
                                className='transition-[stroke-dashoffset] duration-500 opacity-50'
                                style={{
                                    strokeDasharray: `${circumference * (additionalValue / 100)} ${circumference}`,
                                    strokeDashoffset: 0,
                                }}
                                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                            />
                        )}
                    </svg>
                    <div
                        className='absolute inset-0 flex items-center justify-center text-[calc(0.38*var(--size))] font-semibold'
                        style={
                            { '--size': `${size}px` } as React.CSSProperties
                        }>
                        {children ?? <span>{Math.round(value)} %</span>}
                    </div>
                </div>
            </HoverCardTrigger>
            <HoverCardContent
                className={cn(
                    'w-64 rounded-lg p-2 shadow-lg backdrop-blur-xs bg-white/20',
                )}>
                <MacroHoverCard
                    macroType={macroType}
                    currentAmount={currentAmount}
                    targetAmount={targetAmount}
                    value={value}
                    additionalValue={additionalValue}
                />
            </HoverCardContent>
        </HoverCard>
    );
}
