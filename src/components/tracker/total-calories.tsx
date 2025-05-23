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
    Tooltip,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import Macronutrients from './macro-view';
import { useDailyPlanStore } from '@/stores/daily-tracker';
import { calculateCaloriesFromMacros } from '@/lib/algorithm/calculate';

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

export default function TotalCalories() {
    const dailyPlan = useDailyPlanStore((state) => state.dailyPlan);

    if (!dailyPlan) return null;

    const { totalMacros, goal } = dailyPlan;

    if (!totalMacros) return;

    console.log(dailyPlan)

    const totalCalories = calculateCaloriesFromMacros(totalMacros);

    const totalCalorieData = [
        {
            type: 'Gegessen',
            value: totalCalories,
            fill: 'var(--chart-1)',
        },
        {
            type: 'Übrig',
            value: Math.max(0, goal.calories - totalCalories),
            fill: 'var(--chart-empty)',
        },
    ];

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
                                <Tooltip content={<CustomTooltip />} />
                                <Pie
                                    data={totalCalorieData}
                                    dataKey='value'
                                    nameKey='type'
                                    innerRadius={60}
                                    outerRadius={100}
                                    startAngle={90}
                                    endAngle={-270}
                                    cornerRadius={12}
                                    isAnimationActive={false}
                                    stroke='var(--border)'
                                    paddingAngle={2}
                                    strokeWidth={2}>
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
                                                            {Math.round(
                                                                totalCalories,
                                                            ).toLocaleString()}
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
                    carbs={totalMacros?.carbs || 0}
                    protein={totalMacros?.protein || 0}
                    fat={totalMacros?.fat || 0}
                    className='max-w-md'
                />
            </CardContent>
        </Card>
    );
}

function CustomTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: Array<{
        payload: { type: string; value: number };
    }>;
}) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className='bg-background border rounded-lg p-2 shadow-lg'>
                <p className='font-medium'>{data.type}</p>
                <p className='text-sm text-muted-foreground'>
                    {Math.round(data.value)} kcal
                </p>
            </div>
        );
    }
    return null;
}
