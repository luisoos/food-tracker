'use client';

import * as React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    Pie,
    PieChart,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Label,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import Macronutrients from './macro-view';

const totalCalorieChartConfig = {
    eaten: {
        label: 'Gegessen',
        color: 'var(--chart-1)',
    },
    other: {
        label: 'Übrig',
        color: 'var(--chart-empty)',
    },
} satisfies ChartConfig;

export default function TotalCalories({
    totalCalories,
    fats,
    carbohydrates,
    protein,
}: {
    totalCalories: number;
    fats: number;
    carbohydrates: number;
    protein: number;
}) {
    // TODO: Demo-Daten mit tatsächlichen Daten anbinden; Localstorage als Datenbank
    const totalCalorieData = [
        { type: 'Gegessen', value: totalCalories, fill: 'var(--chart-1)' },
        { type: 'Übrig', value: 700, fill: 'var(--chart-empty)' },
    ];

    const macroData = {
        carbs: {
            consumed: 230,
            total: 264,
            color: '#DB8DE7', // Purple for carbs
        },
        protein: {
            consumed: 114,
            total: 120,
            color: '#F4B43B', // Amber for protein
        },
        fat: {
            consumed: 34,
            total: 85,
            color: '#2DABEA', // Cyan for fat
        },
    };

    return (
        <Card className='flex flex-col'>
            <CardHeader className='items-center pb-0'>
                <CardTitle className='text-2xl font-semibold'>
                    Dein Kalorienbedarf
                </CardTitle>
            </CardHeader>
            <CardContent className='lg:flex flex-row gap-6 mb-6'>
                <div className='flex-1 max-md:h-56 min-w-0 flex items-center justify-center'>
                    <ChartContainer
                        config={totalCalorieChartConfig}
                        className='w-full h-56 mb-4'>
                        <ResponsiveContainer width='100%' height={220}>
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={totalCalorieData}
                                    dataKey='value'
                                    nameKey='type'
                                    innerRadius={60}
                                    outerRadius={100}
                                    strokeWidth={5}
                                    startAngle={90}
                                    endAngle={-270}
                                    cornerRadius={12}
                                    isAnimationActive={false}>
                                    <Label
                                        position='center'
                                        content={({ viewBox }) => {
                                            if (
                                                viewBox &&
                                                'cx' in viewBox &&
                                                'cy' in viewBox
                                            ) {
                                                return (
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor='middle'
                                                        dominantBaseline='middle'>
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            className='fill-foreground text-3xl font-bold'>
                                                            {totalCalories.toLocaleString()}
                                                        </tspan>
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={
                                                                (viewBox.cy ||
                                                                    0) + 24
                                                            }
                                                            className='fill-muted-foreground text-base'>
                                                            Kalorien
                                                        </tspan>
                                                    </text>
                                                );
                                            }
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                <Macronutrients
                    carbs={macroData.carbs}
                    protein={macroData.protein}
                    fat={macroData.fat}
                />
            </CardContent>
        </Card>
    );
}
