import { useRecipe } from '@/hooks/useRecipeById';
import { useRecipeAdjustment } from '@/hooks/useRecipeAdjustment';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Input } from '../ui/input';
import Macronutrients from './macro-view';
import { cn, eggToGram, gramOrEgg, toGermanNumber } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import IngredientAdjustBanner from './ingredient-adjust-banner';
import {
    DailyPlan,
    Macros,
    MealType,
    ParentAdjustment,
    RecipeIngredient,
} from '@/lib/types';
import IngredientAmountReason from './ingredient-amount-reason';
import { calculateCaloriesFromMacros } from '@/lib/algorithm/calculate';
import { NumberTicker } from '../magicui/number-ticker';
import MacroRing from './macro-ring';
import { useDailyBalanceAdjustment } from '@/hooks/useDailyBalanceAdjustment';
import DailyBalanceButton from './daily-balance-button';
import { CARBS_TARGET, FAT_TARGET, PROTEIN_TARGET } from '@/lib/recipes';
import { toast } from 'sonner';

interface IngredientListProps {
    recipeId: string;
    dailyPlan: DailyPlan | null;
    currentMealType: MealType;
    onMacrosUpdate: (macros: Macros, totalCalories: number) => void;
}

export default function IngredientList({
    recipeId,
    dailyPlan,
    currentMealType,
    onMacrosUpdate,
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
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [originalValues, setOriginalValues] = useState<
        Record<string, number>
    >({});
    const [changedValues, setChangedValues] = useState<Record<string, number>>(
        {},
    );
    const [previousValues, setPreviousValues] = useState<
        Record<string, number>
    >({});
    const [currentValues, setCurrentValues] = useState<Record<string, number>>(
        {},
    );
    const [pendingResetId, setPendingResetId] = useState<string | null>(null);
    const [reasons, setReasons] = useState<Record<string, string>>({});
    const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
    const [shakeBanner, setShakeBanner] = useState(false);

    // Add daily balance adjustment
    const {
        canAdjust,
        isAdjusting: isDailyBalanceAdjusting,
        handleAdjust,
    } = useDailyBalanceAdjustment({
        recipe: data!,
        dailyPlan,
        currentMealType,
        onAdjustmentComplete: (newValues, newReasons) => {
            setChangedValues(newValues);
            setCurrentValues(newValues);
            setPreviousValues(newValues);
            setReasons(newReasons);
        },
    });

    // Hooks
    // State Management for input data
    useEffect(() => {
        if (data) {
            const values: Record<string, number> = {};
            const inputStrings: Record<string, string> = {};
            data.ingredients.forEach((ingredient) => {
                values[ingredient.ingredient.id] = ingredient.amount;
                inputStrings[ingredient.ingredient.id] =
                    ingredient.amount.toString();
            });
            setOriginalValues(values);
            setPreviousValues(values);
            setChangedValues(values);
            setCurrentValues(values);
            setInputValues(inputStrings);
        }
    }, [data]);

    useEffect(() => {
        setInputValues((prev) => {
            const newInputValues: Record<string, string> = { ...prev }; // Preserve existing values
            Object.entries(currentValues).forEach(([id, value]) => {
                newInputValues[id] = value.toString();
            });
            return newInputValues;
        });
    }, [currentValues]);

    // Calculate total macros
    const totalMacros = useMemo(() => {
        if (!data) return { carbs: 0, protein: 0, fat: 0 };

        return data.ingredients.reduce(
            (acc, ingredient) => {
                const currentAmount = currentValues[ingredient.ingredient.id] ?? ingredient.amount;
                const factor = currentAmount / 100;
                acc.carbs += ingredient.ingredient.macrosPer100g.carbs * factor;
                acc.protein +=
                    ingredient.ingredient.macrosPer100g.protein * factor;
                acc.fat += ingredient.ingredient.macrosPer100g.fat * factor;
                return acc;
            },
            { carbs: 0, protein: 0, fat: 0 },
        );
    }, [data, currentValues]);

    // Calculate total calories
    const totalCalories = useMemo(() => {
        return calculateCaloriesFromMacros(totalMacros);
    }, [totalMacros]);

    // Tell the macro details to the parent component
    useEffect(() => {
        onMacrosUpdate(totalMacros, totalCalories);
    }, [totalMacros, totalCalories, onMacrosUpdate]);

    // Decide wether to show the ingredient adjustment banner
    const showBanner = editingIngredientId !== null;

    // Decide when to shake the adjustment banner to draw attention
    useEffect(() => {
        if (editingIngredientId !== null && shakeBanner) {
            setTimeout(() => {
                setShakeBanner(false);
            }, 1000);
        }
    }, [editingIngredientId, shakeBanner]);

    // Render logic
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!data) return <div>No recipe selected!</div>;

    // Handle input change
    function handleInputBlur(ingredientId: string) {
        let inputValue = inputValues[ingredientId];

        // Wenn leer, NICHT automatisch auf 0 setzen
        if (inputValue === '') {
            inputValue = '0';
        }

        const numValue = parseFloat(inputValue) || 0;

        // Stelle sicher, dass Input und numerischer Wert synchron sind
        setInputValues((prev) => ({
            ...prev,
            [ingredientId]: numValue.toString(),
        }));

        changeIngredientAmount(numValue, ingredientId);
    }

    // Handle input change
    function handleInputChange(value: string, ingredientId: string) {
        // Erlaube leeren String und gültige Zahlen
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setInputValues((prev) => ({
                ...prev,
                [ingredientId]: value,
            }));

            // Nur bei nicht-leeren Werten die numerischen States aktualisieren
            if (value !== '') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    changeIngredientAmount(numValue, ingredientId);
                }
            }
        }
    }

    // Change ingredient amount
    function changeIngredientAmount(value: number, ingredientId: string) {
        const isModified = value !== originalValues[ingredientId];
        const isRevertingToOriginal =
            value === originalValues[ingredientId] &&
            currentValues[ingredientId] !== originalValues[ingredientId];

        setEditingIngredientId(ingredientId);

        // NEW: Set pending reset flag for revert detection
        // INTENT: Track when user is reverting to original value to trigger full reset
        if (isRevertingToOriginal) {
            setPendingResetId(ingredientId);
        } else if (isModified) {
            setPendingResetId(null);
        } else {
            setPendingResetId(ingredientId);
        }

        setChangedValues((prev) => ({
            ...prev,
            [ingredientId]: value,
        }));

        setCurrentValues((prev) => ({
            ...prev,
            [ingredientId]: value,
        }));

        setDirtyFields((prev) => {
            const newSet = new Set(prev);
            if (isModified) {
                newSet.add(ingredientId);
            } else {
                newSet.delete(ingredientId);
            }
            return newSet;
        });
    }

    // Handle banner yes event
    // Enhanced adjustment handler with revert detection
    // Handle both normal adjustments and revert-to-original scenarios
    async function handleIngredientAdjustment(ingredientId: string) {
        if (!data || !dailyPlan || !currentMealType) return;

        const originalIngredient = data.ingredients.find(
            (i) => i.ingredient.id === ingredientId,
        );

        if (!originalIngredient) return;

        // Check if this is a revert to original value
        const isRevertToOriginal =
            changedValues[ingredientId] === originalValues[ingredientId] &&
            pendingResetId === ingredientId;

        const modifiedRecipe = {
            ...data,
            ingredients: data.ingredients.map((ingredient) => ({
                ...ingredient,
                amount: previousValues[ingredient.ingredient.id],
                ingredient: {
                    ...ingredient.ingredient,
                    isFlexible: dirtyFields.has(ingredient.ingredient.id)
                        ? false
                        : ingredient.ingredient.isFlexible,
                },
            })),
        };

        // Log the recipe data being sent
        console.log('Recipe data being sent:', JSON.stringify(modifiedRecipe, null, 2));

        const changedIngredient = {
            ...originalIngredient,
            amount: changedValues[ingredientId],
        };

        try {
            const result = await adjustRecipe(
                modifiedRecipe,
                currentMealType,
                dailyPlan,
                isRevertToOriginal, // Pass revert flag to backend
                changedIngredient,
            );

            if (
                result &&
                result.adjustments.success &&
                Array.isArray(result.adjustments.data)
            ) {
                // Handle full reset if reverting to original
                // Reset all ingredients to original state when user reverts
                if (isRevertToOriginal) {
                    setChangedValues({ ...originalValues });
                    setCurrentValues({ ...originalValues });
                    setPreviousValues({ ...originalValues });
                    setReasons({});
                } else {
                    const newValues = { ...currentValues };
                    const newReasons = { ...reasons };
                    result.adjustments.data.forEach(
                        (adjusted: ParentAdjustment) => {
                            newValues[adjusted.ingredientId] = Math.round(
                                adjusted.newAmount,
                            );
                            newReasons[adjusted.ingredientId] = adjusted.reason;
                        },
                    );
                    delete newReasons[ingredientId];
                    setChangedValues(newValues);
                    setCurrentValues(newValues);
                    setPreviousValues(newValues);
                    setReasons(newReasons);
                }
            } else if (result && !result.adjustments.success) {
                // Notify user, why nothing was changed
                toast(result.adjustments.error)
            }
        } catch (error) {
            console.error('Failed to adjust recipe:', error);
        } finally {
            setShakeBanner(false);
            setEditingIngredientId(null);
            setPendingResetId(null);
        }
    }

    function handleBannerNo() {
        setShakeBanner(false);
        setEditingIngredientId(null);
    }

    return (
        <div className='md:grid grid-cols-2 gap-8'>
            <div className='flex flex-col'>
                <div className='flex justify-between items-center mb-2'>
                    <h3 className='text-sm font-medium text-zinc-600'>
                        {/* Zutaten anpassen */}
                    </h3>
                    {canAdjust && (
                        <DailyBalanceButton
                            className='mt-2'
                            onClick={handleAdjust}
                            isLoading={isDailyBalanceAdjusting}
                        />
                    )}
                </div>
                <Table className='max-w-xl'>
                    <TableBody>
                        {data.ingredients.map((ingredient, index) => {
                            const isLocked =
                                editingIngredientId !== null &&
                                editingIngredientId !==
                                    ingredient.ingredient.id;

                            const isEgg = ingredient.ingredient.id === 'egg';

                            return (
                                <TableRow key={index}>
                                    <TableCell className='flex items-center text-center w-20'>
                                        <Input
                                            className={cn(
                                                'p-0 h-8 w-16 text-center border-none shadow-none bg-zinc-300',
                                                isLocked &&
                                                    'bg-zinc-100 text-zinc-500',
                                            )}
                                            type='text'
                                            id={ingredient.ingredient.id}
                                            value={
                                                gramOrEgg(inputValues[ingredient.ingredient.id], isEgg) ?? ''
                                            }
                                            readOnly={isLocked}
                                            onClick={() => {
                                                if (isLocked)
                                                    setShakeBanner(true);
                                            }}
                                            onChange={(e) => {
                                                if (!isLocked) {
                                                    handleInputChange(
                                                        eggToGram(
                                                            e.target.value
                                                        , isEgg).toString(), 
                                                        ingredient.ingredient
                                                            .id,
                                                    );
                                                }
                                            }}
                                            onBlur={() => {
                                                if (!isLocked) {
                                                    handleInputBlur(
                                                        ingredient.ingredient
                                                            .id,
                                                    );
                                                }
                                            }}
                                        />
                                        {!isEgg && <span className='h-8 ml-1 flex items-center leading-8'>
                                            g
                                        </span>}
                                    </TableCell>
                                    <TableCell
                                        className={`w-8 ${
                                            inputValues[
                                                ingredient.ingredient.id
                                            ] !==
                                            (originalValues[
                                                ingredient.ingredient.id
                                            ]?.toString() ||
                                                ingredient.amount.toString())
                                                ? 'text-red-700 line-through'
                                                : 'text-zinc-400'
                                        }`}>
                                        {toGermanNumber(gramOrEgg(
                                                            ingredient.amount.toString(), isEgg))}
                                        {!isEgg && 'g'}
                                    </TableCell>

                                    <TableCell className='font-medium w-full'>
                                        <div className='flex'>
                                            {isEgg ? 'Eier (Größe M / 60 g)' : ingredient.ingredient.name}
                                            {reasons[
                                                ingredient.ingredient.id
                                            ] && (
                                                <IngredientAmountReason
                                                    reason={
                                                        reasons[
                                                            ingredient
                                                                .ingredient.id
                                                        ] || 'Keine Anpassung'
                                                    }
                                                />
                                            )}
                                        </div>
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
                            await handleIngredientAdjustment(
                                editingIngredientId,
                            );
                        }}
                        onNo={handleBannerNo}
                    />
                )}
            </div>
            <div>
                <div className='max-md:hidden'>
                    <Macronutrients
                        carbs={totalMacros.carbs}
                        protein={totalMacros.protein}
                        fat={totalMacros.fat}
                    />
                </div>
                <div className='md:hidden flex items-center gap-4 justify-center py-2'>
                    <div className='flex flex-col items-center'>
                        <MacroRing
                            value={CARBS_TARGET ? (totalMacros.carbs / CARBS_TARGET) * 100 : 0}
                            color='#e0d83c'
                            size={48}>
                            <span className='text-xs font-semibold'>
                                {Math.round(
                                    CARBS_TARGET ? (totalMacros.carbs / CARBS_TARGET) * 100 : 0,
                                )}{' '}
                                %
                            </span>
                        </MacroRing>
                        <span className='text-xs mt-1 text-zinc-500'>KH</span>
                    </div>
                    <div className='flex flex-col items-center'>
                        <MacroRing
                            value={PROTEIN_TARGET ? (totalMacros.protein / PROTEIN_TARGET) * 100 : 0}
                            color='#30bc29'
                            size={48}>
                            <span className='text-xs font-semibold'>
                                {Math.round(
                                    PROTEIN_TARGET ? (totalMacros.protein / PROTEIN_TARGET) * 100 : 0,
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
                            value={FAT_TARGET ? (totalMacros.fat / FAT_TARGET) * 100 : 0}
                            color='#e0423c'
                            size={48}>
                            <span className='text-xs font-semibold'>
                                {Math.round(
                                    FAT_TARGET ? (totalMacros.fat / FAT_TARGET) * 100 : 0,
                                )}{' '}
                                %
                            </span>
                        </MacroRing>
                        <span className='text-xs mt-1 text-zinc-500'>Fett</span>
                    </div>
                </div>
                <div className='md:mt-20 text-right'>
                    <NumberTicker
                        value={totalCalories}
                        startValue={Math.round(
                            totalCalories - totalCalories / 20,
                        )}
                        decimalPlaces={0}
                        className='whitespace-pre-wrap text-3xl font-bold tracking-tighter text-black dark:text-white'
                    />
                    <span className='font-mono'> kcal</span>
                </div>
            </div>
        </div>
    );
}
