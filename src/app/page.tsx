'use client';

import Navigation from '@/components/navigation';
import { DatePicker } from '@/components/tracker/date';
import MealSelector from '@/components/tracker/meal-selector';
import TotalCalories from '@/components/tracker/total-calories';
import { useDailyPlanStore } from '@/stores/daily-tracker';
import { useEffect } from 'react';

export default function Home() {
    const loadDailyPlan = useDailyPlanStore((state) => state.loadDailyPlan);

    useEffect(() => {
        loadDailyPlan();
    }, [loadDailyPlan]);

    return (
        <div className='w-11/12 lg:max-w-4xl mx-auto h-full min-h-screen'>
            <Navigation />
            <div className='mt-6'>
                <DatePicker />
            </div>
            <div className='mt-6'>
                <TotalCalories />
            </div>
            <div className='mt-6 mb-2'>
                <MealSelector />
            </div>
        </div>
    );
}
