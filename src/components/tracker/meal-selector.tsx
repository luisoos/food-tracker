'use client';

import { MealType, Meal } from '@/lib/types';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '../ui/card';
import { useDailyPlanStore } from '@/stores/daily-tracker';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import RecipeSelector from './recipe-selector';

export default function MealSelector() {
    const dailyPlan = useDailyPlanStore((state) => state.dailyPlan);
    const setDailyPlan = useDailyPlanStore((state) => state.setDailyPlan);
    const loadDailyPlan = useDailyPlanStore((state) => state.loadDailyPlan);

    const [breakfast, setBreakfast] = useState<Meal>();
    const [lunch, setLunch] = useState<Meal>();
    const [dinner, setDinner] = useState<Meal>();

    useEffect(() => {
        loadDailyPlan();
        if (dailyPlan)
            dailyPlan.meals.forEach((meal) => {
                switch (meal.type) {
                    case MealType.BREAKFAST:
                        setBreakfast(meal);
                        break;
                    case MealType.LUNCH:
                        setLunch(meal);
                        break;
                    case MealType.DINNER:
                        setDinner(meal);
                        break;
                    default:
                        console.error('Meal that was not the right type.');
                }
            });
    }, [loadDailyPlan]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-2xl font-semibold'>
                    Deine Mahlzeiten
                </CardTitle>
                <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='grid grid-cols-3 max-md:grid-cols-1 gap-4'>
                    <MealDisplay typeName='Frühstück' content={breakfast} />
                    <MealDisplay typeName='Mittagessen' content={lunch} />
                    <MealDisplay typeName='Abendessen' content={dinner} />
                </div>
            </CardContent>
        </Card>
    );
}

function MealDisplay({
    typeName,
    content,
}: {
    typeName: string;
    content: Meal | undefined;
}) {
    return (
        <div key={content?.type || typeName}>
            <div className='flex flex-col justify-center items-center rounded-lg border shadow-inner w-full h-32'>
                {content ? (
                    <p className='font-semibold'>{content.recipe.name}</p>
                ) : (
                    <RecipeSelector typeName={typeName}>
                        <Plus size={48} className='text-zinc-300 mx-auto' />
                    </RecipeSelector>
                )}
            </div>

            <p className='text-center font-medium'>{typeName}</p>
        </div>
    );
}
