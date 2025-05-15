// Berechnungen verschiedener Zusammensetzungen ("Mini-Facade")

import {
    CARBS_CALORIES_PER_GRAM,
    FAT_CALORIES_PER_GRAM,
    PROTEIN_CALORIES_PER_GRAM,
    Ingredient,
    Macros,
    Recipe,
    DailyPlan,
    DailyGoal,
} from '../types';

// Berechnet Makros für eine bestimmte Menge einer Zutat
export function calculateIngredientMacros(
    ingredient: Ingredient,
    amount: number,
): Macros {
    const factor = amount / 100.0;
    return {
        protein: ingredient.macrosPer100g.protein * factor,
        carbs: ingredient.macrosPer100g.carbs * factor,
        fat: ingredient.macrosPer100g.fat * factor,
    };
}

// Berechnet Gesamtmakros für ein Rezept
export function calculateRecipeMacros(recipe: Recipe): Macros {
    return recipe.ingredients.reduce(
        (total, recipeIngredient) => {
            const macros = calculateIngredientMacros(
                recipeIngredient.ingredient,
                recipeIngredient.amount,
            );
            return {
                protein: total.protein + macros.protein,
                carbs: total.carbs + macros.carbs,
                fat: total.fat + macros.fat,
            };
        },
        { protein: 0, carbs: 0, fat: 0 },
    );
}

// Berechnet Kalorien aus Makros
export function calculateCaloriesFromMacros(macros: Macros): number {
    return (
        macros.protein * PROTEIN_CALORIES_PER_GRAM +
        macros.carbs * CARBS_CALORIES_PER_GRAM +
        macros.fat * FAT_CALORIES_PER_GRAM
    );
}

export function calculateMacroDifference(
    ingredient: Ingredient,
    originalAmount: number,
    newAmount: number,
): Macros {
    const originalMacros = calculateIngredientMacros(
        ingredient,
        originalAmount,
    );
    const newMacros = calculateIngredientMacros(ingredient, newAmount);
    return {
        protein: newMacros.protein - originalMacros.protein,
        carbs: newMacros.carbs - originalMacros.carbs,
        fat: newMacros.fat - originalMacros.fat,
    };
}

export function calculateRemainingMacros(dailyPlan: DailyPlan): Macros {
    const totalConsumed = dailyPlan.meals.reduce(
        (sum, meal) => {
            const mealMacros = calculateRecipeMacros(meal.recipe);
            return {
                protein: sum.protein + mealMacros.protein,
                carbs: sum.carbs + mealMacros.carbs,
                fat: sum.fat + mealMacros.fat,
            };
        },
        { protein: 0, carbs: 0, fat: 0 },
    );
    return {
        protein: dailyPlan.goal.macros.protein - totalConsumed.protein,
        carbs: dailyPlan.goal.macros.carbs - totalConsumed.carbs,
        fat: dailyPlan.goal.macros.fat - totalConsumed.fat,
    };
}

export function isWithinGoal(
    macro: keyof Macros,
    currentValue: number,
    goal: DailyGoal,
): boolean {
    const target = goal.macros[macro];
    const tolerance = target * (goal.macros.plusMinusPercentage / 100);

    return (
        currentValue >= target - tolerance && currentValue <= target + tolerance
    );
}

export function getMaxCompensation(macro: keyof Macros): number {
    // Basierend auf durchschnittlicher maximaler Kompensationsfähigkeit pro Mahlzeit
    const maxValues: Record<keyof Macros, number> = {
        protein: 30, // Maximal 30g Protein pro Mahlzeit anpassbar
        carbs: 50,
        fat: 20,
    };
    return maxValues[macro];
}
