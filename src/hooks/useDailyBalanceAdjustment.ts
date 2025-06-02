import { useCallback, useMemo } from 'react';
import {
    DailyPlan,
    Macros,
    MealType,
    Recipe,
    ParentAdjustment,
} from '@/lib/types';
import { useRecipeAdjustment } from './useRecipeAdjustment';

interface UseDailyBalanceAdjustmentProps {
    recipe: Recipe;
    dailyPlan: DailyPlan | null;
    currentMealType: MealType;
    onAdjustmentComplete?: (
        newValues: Record<string, number>,
        newReasons: Record<string, string>,
    ) => void;
}

interface UseDailyBalanceAdjustmentResult {
    canAdjust: boolean;
    remainingMacros: Macros;
    isAdjusting: boolean;
    handleAdjust: () => Promise<void>;
}

const MACRO_THRESHOLDS = {
    protein: 5, // 5g minimum deficit
    carbs: 10, // 10g minimum deficit
    fat: 3, // 3g minimum deficit
};

export function useDailyBalanceAdjustment({
    recipe,
    dailyPlan,
    currentMealType,
    onAdjustmentComplete,
}: UseDailyBalanceAdjustmentProps): UseDailyBalanceAdjustmentResult {
    const { adjustRecipe, isLoading: isAdjusting } = useRecipeAdjustment();

    // Calculate remaining macros needed for the day
    const remainingMacros = useMemo(() => {
        if (!dailyPlan) return { protein: 0, carbs: 0, fat: 0 };

        const consumedMacros = dailyPlan.meals.reduce(
            (acc, meal) => {
                if (meal.recipe.totalMacros) {
                    acc.protein += meal.recipe.totalMacros.protein;
                    acc.carbs += meal.recipe.totalMacros.carbs;
                    acc.fat += meal.recipe.totalMacros.fat;
                }
                return acc;
            },
            { protein: 0, carbs: 0, fat: 0 },
        );

        return {
            protein: Math.max(0, 120 - consumedMacros.protein), // 120g protein target
            carbs: Math.max(0, 264 - consumedMacros.carbs), // 264g carbs target
            fat: Math.max(0, 85 - consumedMacros.fat), // 85g fat target
        };
    }, [dailyPlan]);

    // Determine if adjustment is needed based on thresholds
    const canAdjust = useMemo(() => {
        return (
            remainingMacros.protein > MACRO_THRESHOLDS.protein ||
            remainingMacros.carbs > MACRO_THRESHOLDS.carbs ||
            remainingMacros.fat > MACRO_THRESHOLDS.fat
        );
    }, [remainingMacros]);

    // Handle the adjustment
    const handleAdjust = useCallback(async () => {
        if (!dailyPlan || !canAdjust) return;

        try {
            const result = await adjustRecipe(
                recipe,
                currentMealType,
                dailyPlan,
                false, // not a revert
            );

            if (
                result &&
                result.adjustments.success &&
                Array.isArray(result.adjustments.data)
            ) {
                const newValues: Record<string, number> = {};
                const newReasons: Record<string, string> = {};

                result.adjustments.data.forEach(
                    (adjusted: ParentAdjustment) => {
                        newValues[adjusted.ingredientId] = Math.round(
                            adjusted.newAmount,
                        );
                        newReasons[adjusted.ingredientId] = adjusted.reason;
                    },
                );

                // Call the callback with the new values and reasons
                onAdjustmentComplete?.(newValues, newReasons);
            }
        } catch (error) {
            console.error('Failed to adjust recipe for daily balance:', error);
        }
    }, [
        recipe,
        dailyPlan,
        currentMealType,
        canAdjust,
        adjustRecipe,
        onAdjustmentComplete,
    ]);

    return {
        canAdjust,
        remainingMacros,
        isAdjusting,
        handleAdjust,
    };
}
