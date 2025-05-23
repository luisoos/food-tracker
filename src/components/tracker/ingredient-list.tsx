import { useRecipe } from '@/hooks/useRecipeById';
import { useRecipeAdjustment } from '@/hooks/useRecipeAdjustment';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Input } from '../ui/input';
import Macronutrients from './macro-view';
import { cn, toGermanNumber } from '@/lib/utils';
import { useEffect, useState } from 'react';
import IngredientAdjustBanner from './ingredient-adjust-banner';
import { DailyPlan, MealType, ParentAdjustment, RecipeIngredient } from '@/lib/types';

interface IngredientListProps {
    recipeId: string;
    dailyPlan: DailyPlan | null;
    currentMealType: MealType;
}

export default function IngredientList({
    recipeId,
    dailyPlan,
    currentMealType,
}: IngredientListProps) {
    // States
    const { data, isLoading, error } = useRecipe(recipeId);
    const {
        adjustRecipe,
        isLoading: isAdjusting,
        error: adjustmentError,
    } = useRecipeAdjustment();
    const [editingIngredientId, setEditingIngredientId] = useState<
        string | null
    >(null);
    const [originalValues, setOriginalValues] = useState<
        Record<string, number>
    >({});
    const [changedValues, setChangedValues] = useState<
        Record<string, number>
    >({});
    const [shakeBanner, setShakeBanner] = useState(false);

    // Hooks
    useEffect(() => {
        if (data) {
            const values: Record<string, number> = {};
            data.ingredients.forEach((ingredient) => {
                values[ingredient.ingredient.id] = ingredient.amount;
            });
            setOriginalValues(values);
            setChangedValues(values);
        }
    }, [data]);

    useEffect(() => {
        if (editingIngredientId !== null && shakeBanner) {
            setTimeout(() => {
                setShakeBanner(false);
            }, 1000);
        }
    }, [editingIngredientId, shakeBanner]);

    const showBanner = editingIngredientId !== null;

    // Render
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!data) return <div>No recipe selected!</div>;

    // Calculate total macros
    const totalMacros = data.ingredients.reduce(
        (acc, ingredient) => {
            const factor = ingredient.amount / 100;
            acc.carbs += ingredient.ingredient.macrosPer100g.carbs * factor;
            acc.protein += ingredient.ingredient.macrosPer100g.protein * factor;
            acc.fat += ingredient.ingredient.macrosPer100g.fat * factor;
            return acc;
        },
        { carbs: 0, protein: 0, fat: 0 },
    );

    // Change ingredient amount
    function changeIngredientAmount(value: number, ingredientId: string) {
        const isModified = value !== originalValues[ingredientId];

        setChangedValues((prev) => ({
            ...prev,
            [ingredientId]: value,
        }));

        setEditingIngredientId(isModified ? ingredientId : null);
    }

    // Handle input blur event
    function handleBlur(ingredientId: string, value: number) {
        if (value === originalValues[ingredientId]) {
            setEditingIngredientId(null);
        }
    }

    // Handle banner yes event
    async function handleIngredientAdjustment(ingredientId: string) {
        if (!data || !dailyPlan || !currentMealType) return;

        const originalIngredient = data.ingredients.find(
            (i) => i.ingredient.id === ingredientId,
        );
        
        if (!originalIngredient) return;
        
        const changedIngredient = {
            ...originalIngredient,
            amount: changedValues[ingredientId]
        };

        try {
            const result = await adjustRecipe(
                data,
                currentMealType,
                dailyPlan,
                changedIngredient,
            );

            if (result && result.adjustments && Array.isArray(result.adjustments)) {
                const newValues = { ...changedValues };
                result.adjustments.forEach((adjusted: ParentAdjustment) => {
                    newValues[adjusted.ingredientId] = adjusted.newAmount;
                });
                setChangedValues(newValues);
                // TODO: Input values need to be changed !!!
            }
        } catch (error) {
            console.error('Failed to adjust recipe:', error);
            // Optionally show error to user
        } finally {
            setShakeBanner(false);
            setEditingIngredientId(null);
        }
    }

    function handleBannerNo() {
        setShakeBanner(false);
        setEditingIngredientId(null);
    }

    return (
        <div className='md:grid grid-cols-2 gap-8'>
            <div className='flex flex-col'>
                <Table className='max-w-xl'>
                    <TableBody>
                        {data.ingredients.map((ingredient, index) => {
                            const isLocked =
                                editingIngredientId !== null &&
                                editingIngredientId !==
                                    ingredient.ingredient.id;
                            return (
                                <TableRow key={index}>
                                    <TableCell className='flex items-center text-center w-20'>
                                        <Input
                                            className={cn(
                                                'p-0 h-8 w-16 text-center border-none shadow-none bg-zinc-300',
                                                isLocked &&
                                                    'bg-zinc-100 text-zinc-500',
                                            )}
                                            type='number'
                                            id={ingredient.ingredient.id}
                                            defaultValue={ingredient.amount}
                                            min={1}
                                            readOnly={isLocked}
                                            onClick={() => {
                                                if (isLocked)
                                                    setShakeBanner(true);
                                            }}
                                            onChange={(e) => {
                                                if (!isLocked) {
                                                    changeIngredientAmount(
                                                        Number(e.target.value),
                                                        ingredient.ingredient
                                                            .id,
                                                    );
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!isLocked) {
                                                    handleBlur(
                                                        ingredient.ingredient
                                                            .id,
                                                        Number(e.target.value),
                                                    );
                                                }
                                            }}
                                        />
                                        <span className='h-8 ml-1 flex items-center leading-8'>
                                            g
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className={`w-8 ${changedValues[ingredient.ingredient.id] !== originalValues[ingredient.ingredient.id] ? 'text-red-700 line-through' : 'text-zinc-400'}`}>
                                        {toGermanNumber(ingredient.amount)}g
                                    </TableCell>
                                    <TableCell className='font-medium w-full'>
                                        {ingredient.ingredient.name}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                {showBanner && (
                    <IngredientAdjustBanner
                        shake={shakeBanner}
                        isLoading={isAdjusting}
                        onYes={async () => {
                            if (editingIngredientId) {
                                await handleIngredientAdjustment(
                                    editingIngredientId,
                                );
                            }
                        }}
                        onNo={handleBannerNo}
                    />
                )}
            </div>
            <Macronutrients
                carbs={totalMacros.carbs}
                protein={totalMacros.protein}
                fat={totalMacros.fat}
            />
        </div>
    );
}
