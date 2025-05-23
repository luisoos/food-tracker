import {
    AdjustmentOutput,
    Recipe,
    DailyPlan,
    RecipeIngredient,
    MealType,
} from '@/lib/types';
import { useState, useCallback } from 'react';

export function useRecipeAdjustment() {
    const [adjustmentResult, setAdjustmentResult] =
        useState<AdjustmentOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const adjustRecipe = useCallback(
        async (
            recipe: Recipe,
            currentMealType: MealType,
            dailyPlan: DailyPlan,
            isRevertToOriginal: boolean,
            changedIngredient?: RecipeIngredient,
        ) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/adjust-recipe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        recipe,
                        changedIngredient,
                        dailyPlan,
                        currentMealType,
                    }),
                });

                if (!response.ok) {
                    // TODO: shadcn/ui sonner error feedback
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                setAdjustmentResult(result);
                return result;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'Unbekannter Fehler';
                setError(message);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    return {
        adjustmentResult,
        isLoading,
        error,
        adjustRecipe,
    };
}
