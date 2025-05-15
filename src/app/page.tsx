import Navigation from '@/components/navigation';
import { DatePicker } from '@/components/tracker/date';
import MealSelector from '@/components/tracker/meal-selector';
import TotalCalories from '@/components/tracker/total-calories';

export default function Home() {
    return (
        <div className='w-11/12 lg:max-w-4xl mx-auto h-full min-h-screen'>
            <Navigation />
            <div className='mt-6'>
                <DatePicker />
            </div>
            <div className='mt-6'>
                <TotalCalories
                    totalCalories={2230}
                    fats={123}
                    carbohydrates={54}
                    protein={91}
                />
            </div>
            <div className='mt-6'>
                <MealSelector />
            </div>
        </div>
    );
}
