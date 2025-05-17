import { ReactNode, useState } from 'react';
import {
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
    Drawer,
} from '../ui/drawer';
import { Button } from '../ui/button';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/lib/types';
import MacroRing from './macro-ring';
import IngredientList from './ingredient-list';

export default function RecipeSelector({
    typeName,
    children,
}: {
    typeName: string;
    children: ReactNode;
}) {
    const [recipeId, setRecipeId] = useState<string | undefined>(undefined);

    const handleRecipeSelection = (recipeId: string) => {
        setRecipeId(recipeId);
        // "back"-button: resets selected recipe (setRecipeId())
    };

    const resetRecipeSelection = (recipeId: string) => {
        setRecipeId(undefined);
    };

    return (
        <Drawer>
            <DrawerTrigger className='w-full h-full cursor-pointer'>
                {children}
            </DrawerTrigger>
            <DrawerContent className='px-4 md:px-32 xl:px-72'>
                <DrawerHeader>
                    <DrawerTitle className='text-xl'>
                        {typeName} hinzufügen
                    </DrawerTitle>
                    {!recipeId ? (
                        <>
                            <DrawerDescription>
                                Wähle ein Rezept aus:
                            </DrawerDescription>
                            <RecipeList onSelect={handleRecipeSelection} />
                        </>
                    ) : (
                        <>
                            <DrawerDescription>
                                Zutaten 
                            </DrawerDescription>
                            <IngredientList recipeId={recipeId!} onBack={resetRecipeSelection} />
                        </>
                    )}
                </DrawerHeader>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant='outline'>Abbrechen</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

function RecipeList({ onSelect }: { onSelect: (data: string) => void }) {
    const { data, isLoading, error } = useRecipes();

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

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2'>
            {Object.values(data as Record<string, Recipe>).map((recipe) => {
                const macros = calculateMacros(recipe);
                const totalCalories =
                    macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;

                return (
                    <div
                        key={recipe.id}
                        className='p-4 rounded-lg border shadow-inner hover:scale-95 duration-300 delay-50 transition-all cursor-pointer'
                        onClick={() => onSelect(recipe.id)}>
                        <h3 className='font-semibold text-lg mb-2'>
                            {recipe.name}
                        </h3>
                        <div className='text-sm mb-4'>
                            <p className='font-semibold'>Zutaten:</p>
                            <p className='text-zinc-600'>
                                {recipe.ingredients.map(
                                    ({ ingredient, amount }, index, array) => (
                                        <span key={ingredient.id}>
                                            {ingredient.name} ({amount}g)
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
                                        value={(macros.carbs / 264) * 100}
                                        color='#DB8DE7'
                                        size={48}>
                                        <span className='text-xs font-semibold'>
                                            {Math.round(
                                                (macros.carbs / 264) * 100,
                                            )}{' '}
                                            %
                                        </span>
                                    </MacroRing>
                                    <span className='text-xs mt-1 text-zinc-500'>
                                        KH
                                    </span>
                                </div>
                                <div className='flex flex-col items-center'>
                                    <MacroRing
                                        value={(macros.protein / 120) * 100}
                                        color='#F4B43B'
                                        size={48}>
                                        <span className='text-xs font-semibold'>
                                            {Math.round(
                                                (macros.protein / 120) * 100,
                                            )}{' '}
                                            %
                                        </span>
                                    </MacroRing>
                                    <span className='text-xs mt-1 text-zinc-500'>
                                        Protein
                                    </span>
                                </div>
                                <div className='flex flex-col items-center'>
                                    <MacroRing
                                        value={(macros.fat / 85) * 100}
                                        color='#2DABEA'
                                        size={48}>
                                        <span className='text-xs font-semibold'>
                                            {Math.round(
                                                (macros.fat / 85) * 100,
                                            )}{' '}
                                            %
                                        </span>
                                    </MacroRing>
                                    <span className='text-xs mt-1 text-zinc-500'>
                                        Fett
                                    </span>
                                </div>
                            </div>
                            <div className='text-sm font-medium text-center'>
                                {Math.round(totalCalories)} kcal
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
