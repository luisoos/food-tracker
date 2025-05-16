import React from 'react';

interface MacroRingProps {
    value: number; // 0-100
    color: string;
    size?: number; // px
    strokeWidth?: number;
    children?: React.ReactNode;
}

export default function MacroRing({ value, color, size = 48, strokeWidth = 5, children }: MacroRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - value / 100);

    return (
        <div style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}>
            <svg width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#eee"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s' }}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: size * 0.38,
                }}
            >
                {children ?? <span>{Math.round(value)} %</span>}
            </div>
        </div>
    );
} 