import { useRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/lib/types';
import MacroRing from './macro-ring';
import { gramOrEgg } from '@/lib/utils';
import { useDailyPlanStore } from '@/stores/daily-tracker';

export default function RecipeList({
    onSelect,
}: {
    onSelect?: (data: string) => void;
}) {
    const { data, isLoading, error } = useRecipes();
    const dailyPlan = useDailyPlanStore((state) => state.dailyPlan);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const calculateMacros = (recipe: Recipe) => {
        return recipe.ingredients.reduce(
            (acc, { ingredient, amount }) => {
                const multiplier = amount / 100; // Convert to percentage
                return {
                    protein:
                        acc.protein +
                        ingredient.macrosPer100g.protein * multiplier,
                    carbs:
                        acc.carbs + ingredient.macrosPer100g.carbs * multiplier,
                    fat: acc.fat + ingredient.macrosPer100g.fat * multiplier,
                };
            },
            { protein: 0, carbs: 0, fat: 0 },
        );
    };

    const getCurrentProgress = (macro: 'protein' | 'carbs' | 'fat') => {
        if (!dailyPlan?.totalMacros) return 0;
        const target = {
            protein: 120,
            carbs: 264,
            fat: 85,
        }[macro];
        return (dailyPlan.totalMacros[macro] / target) * 100;
    };

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-2'>
            {Object.values(data as Record<string, Recipe>).map((recipe) => {
                const macros = calculateMacros(recipe);
                const totalCalories =
                    macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;

                const currentCarbs = getCurrentProgress('carbs');
                const currentProtein = getCurrentProgress('protein');
                const currentFat = getCurrentProgress('fat');

                const additionalCarbs = (macros.carbs / 264) * 100;
                const additionalProtein = (macros.protein / 120) * 100;
                const additionalFat = (macros.fat / 85) * 100;

                return (
                    <div
                        key={recipe.id}
                        className=' flex flex-col h-full p-4 rounded-lg border shadow-inner hover:scale-95 duration-300 delay-50 transition-all cursor-pointer'
                        onClick={() => onSelect && onSelect(recipe.id)}>
                        <h3 className='font-semibold text-lg mb-2'>
                            {recipe.name}
                        </h3>
                        <div className='text-sm mb-4'>
                            <p className='font-semibold'>Zutaten:</p>
                            <p className='text-zinc-600'>
                                {recipe.ingredients.map(
                                    ({ ingredient, amount }, index, array) => (
                                        <span key={ingredient.id}>
                                            {ingredient.name} (
                                            {ingredient.id === 'egg'
                                                ? gramOrEgg(
                                                      amount.toString(),
                                                      true,
                                                  ) + ' Stk.'
                                                : amount + 'g'}
                                            )
                                            {index < array.length - 1
                                                ? ', '
                                                : ''}
                                        </span>
                                    ),
                                )}
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <div className='leading-0 mb-3'>
                                <p className='text-sm font-semibold'>
                                    Makronährstoffe:
                                </p>
                                <span className='text-xs text-zinc-600'>
                                    Im Vergleich zu deinem täglichen Bedarf
                                </span>
                            </div>
                            <div className='flex items-center gap-4 justify-center py-2'>
                                <div className='flex flex-col items-center'>
                                    <MacroRing
                                        value={currentCarbs}
                                        additionalValue={additionalCarbs}
                                        color='#e0d83c'
                                        size={48}
                                        macroType='carbs'
                                        currentAmount={
                                            dailyPlan?.totalMacros?.carbs || 0
                                        }
                                        targetAmount={264}>
                                        <span className='text-xs font-semibold'>
                                            {Math.round(macros.carbs)}g
                                        </span>
                                    </MacroRing>
                                    <span className='text-xs mt-1 text-zinc-500'>
                                        KH
                                    </span>
                                </div>
                                <div className='flex flex-col items-center'>
                                    <MacroRing
                                        value={currentProtein}
                                        additionalValue={additionalProtein}
                                        color='#30bc29'
                                        size={48}
                                        macroType='protein'
                                        currentAmount={
                                            dailyPlan?.totalMacros?.protein || 0
                                        }
                                        targetAmount={120}>
                                        <span className='text-xs font-semibold'>
                                            {Math.round(macros.protein)}g
                                        </span>
                                    </MacroRing>
                                    <span className='text-xs mt-1 text-zinc-500'>
                                        Protein
                                    </span>
                                </div>
                                <div className='flex flex-col items-center'>
                                    <MacroRing
                                        value={currentFat}
                                        additionalValue={additionalFat}
                                        color='#e0423c'
                                        size={48}
                                        macroType='fat'
                                        currentAmount={
                                            dailyPlan?.totalMacros?.fat || 0
                                        }
                                        targetAmount={85}>
                                        <span className='text-xs font-semibold'>
                                            {Math.round(macros.fat)}g
                                        </span>
                                    </MacroRing>
                                    <span className='text-xs mt-1 text-zinc-500'>
                                        Fett
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='mt-auto text-sm font-medium text-center'>
                            {Math.round(totalCalories)} kcal
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
