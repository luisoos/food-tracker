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
import { Plus, Trash2, Loader2 } from 'lucide-react';
import RecipeSelector from './recipe-selector';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '../ui/hover-card';

export default function MealSelector() {
    const dailyPlan = useDailyPlanStore((state) => state.dailyPlan);
    const loadDailyPlan = useDailyPlanStore((state) => state.loadDailyPlan);
    const removeMeal = useDailyPlanStore((state) => state.removeMeal);

    const [breakfast, setBreakfast] = useState<Meal>();
    const [lunch, setLunch] = useState<Meal>();
    const [dinner, setDinner] = useState<Meal>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            await loadDailyPlan();
            setIsLoading(false);
        };
        load();
    }, [loadDailyPlan]);

    useEffect(() => {
        if (dailyPlan) {
            // Reset all meals first
            setBreakfast(undefined);
            setLunch(undefined);
            setDinner(undefined);

            // Set meals based on type
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
        }
    }, [dailyPlan]);

    const handleRemoveMeal = (type: MealType) => {
        removeMeal(type);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-2xl font-semibold'>
                    Deine Mahlzeiten
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className='grid grid-cols-3 max-md:grid-cols-1 gap-4'>
                    <MealDisplay
                        type={MealType.BREAKFAST}
                        typeName='Frühstück'
                        content={breakfast}
                        onRemove={handleRemoveMeal}
                        isLoading={isLoading}
                    />
                    <MealDisplay
                        type={MealType.LUNCH}
                        typeName='Mittagessen'
                        content={lunch}
                        onRemove={handleRemoveMeal}
                        isLoading={isLoading}
                    />
                    <MealDisplay
                        type={MealType.DINNER}
                        typeName='Abendessen'
                        content={dinner}
                        onRemove={handleRemoveMeal}
                        isLoading={isLoading}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function MealDisplay({
    type,
    typeName,
    content,
    onRemove,
    isLoading,
}: {
    type: MealType;
    typeName: string;
    content: Meal | undefined;
    onRemove: (type: MealType) => void;
    isLoading: boolean;
}) {
    return (
        <div key={content?.type || typeName}>
            <div className='flex flex-col justify-center items-center rounded-lg border shadow-inner w-full h-32 relative'>
                {isLoading ? (
                    <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                ) : content ? (
                    <div className='flex flex-col items-center gap-2'>
                        <HoverCard>
                            <HoverCardTrigger>
                                <div
                                    className='text-destructive hover:text-destructive/90 cursor-pointer'
                                    onClick={() => onRemove(type)}>
                                    <Trash2
                                        className='absolute top-2 right-2'
                                        size={16}
                                    />
                                </div>
                            </HoverCardTrigger>
                            <HoverCardContent align='start' className="-translate-y-6">
                                {typeName} löschen
                            </HoverCardContent>
                        </HoverCard>
                        <p className='mx-2 text-center font-semibold'>
                            {content.recipe.name}
                        </p>
                    </div>
                ) : (
                    <RecipeSelector typeName={typeName} currentMealType={type}>
                        <Plus size={48} className='text-zinc-300 mx-auto' />
                    </RecipeSelector>
                )}
            </div>

            <p className='text-center font-medium'>{typeName}</p>
        </div>
    );
}
