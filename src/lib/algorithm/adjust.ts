import {
    AdjustmentInput,
    AdjustmentOutput,
    Recipe,
    Macros,
    MealType,
    ParentAdjustment,
} from '../types';
import { translateMacroToGerman } from '../utils';
import {
    calculateMacroDifference,
    calculateRemainingMacros,
    isWithinGoal,
    calculateRecipeMacros,
    calculateCaloriesFromMacros,
    getMaxCompensation,
} from './calculate';
import { findBestIngredientsToAdjust } from './evaluate';
import adjustRecipeIteratively from './daily-evaluation';

export default function adjustRecipe(input: AdjustmentInput): AdjustmentOutput {
    const { recipe, changedIngredient, dailyPlan, currentMealType } = input;

    // Erstelle eine Kopie des Originalrezepts für Anpassungen
    const adjustedRecipe: Recipe = JSON.parse(JSON.stringify(recipe));
    const adjustments: ParentAdjustment[] = [];
    let adjustmentFeedback: string = 'Unbekannter Fehler';

    const alreadyEatenMeals = dailyPlan.meals.length;
    const remainingMeals = Object.keys(MealType).length - alreadyEatenMeals - 1;

    // Fall 1: Benutzer hat Zutatenmenge manuell geändert
    if (changedIngredient) {
        const current = recipe.ingredients.find(
            (ri) => ri.ingredient.id === changedIngredient.ingredient.id,
        );

        if (!current) throw new Error('Zutat nicht gefunden');

        // Berechne Unterschied zwischen alter und neuer Menge
        const macroDiff = calculateMacroDifference(
            changedIngredient.ingredient,
            current.amount,
            changedIngredient.amount,
        );

        // Finde beste Ausgleichsmöglichkeiten
        const bestOptions = findBestIngredientsToAdjust(
            recipe,
            macroDiff,
            changedIngredient.ingredient.id,
        );

        // Übernehme die Top 3 Anpassungen
        if (bestOptions.success) {
            bestOptions.data.slice(0, 3).forEach((option) => {
                const target = adjustedRecipe.ingredients.find(
                    (ri) => ri.ingredient.id === option.ingredientId,
                );

                if (!target) return;

                // 1. Ursprünglichen Wert speichern
                const originalAmount = target.amount;

                // 2. Neuen Wert berechnen
                const newAmount = Math.max(0, target.amount + option.amount);

                // 3. Zutat aktualisieren
                target.amount = newAmount;
                target.originalAmount = originalAmount;

                // 4. Adjustment mit korrekten Werten hinzufügen
                adjustments.push({
                    ingredientId: option.ingredientId,
                    originalAmount, // Echter ursprünglicher Wert
                    newAmount, // Neuer berechneter Wert
                    reason: `${translateMacroToGerman(option.macro)}-Ausgleich`,
                });
            });
        } else {
            adjustmentFeedback = bestOptions.error;
        }

        // Übernehme Benutzeränderung
        const changed = adjustedRecipe.ingredients.find(
            (ri) => ri.ingredient.id === changedIngredient.ingredient.id,
        );

        if (changed) {
            changed.amount = changedIngredient.amount;
            changed.originalAmount = current.originalAmount || current.amount;
        }
    }
    // Fall 2: Automatischer Ausgleich von Tagesdefiziten
    else {
        const remaining =
            dailyPlan.remainingMacros || calculateRemainingMacros(dailyPlan);

        const contributionFactor =
            remainingMeals > 0 ? 1 / (remainingMeals + 1) : 1;

        const targetContribution = {
            protein: remaining.protein * contributionFactor,
            carbs: remaining.carbs * contributionFactor,
            fat: remaining.fat * contributionFactor,
        };

        const needsAdjustment = Object.entries(targetContribution).some(
            ([macro, value]) => Math.abs(value) > 1.0,
        );

        if (!needsAdjustment) {
            return {
                adjustedRecipe: adjustedRecipe, // Fixed: use adjustedRecipe
                adjustments: {
                    success: false,
                    error: 'Du benötigst keine Anpassung für diese Mahlzeit.',
                },
            };
        }

        // Run iterative adjustment
        const iterativeResult = adjustRecipeIteratively(
            adjustedRecipe,
            targetContribution,
            dailyPlan,
        );

        if (iterativeResult.success) {
            adjustments.push(...iterativeResult.adjustments);

            // CRITICAL FIX: Apply the adjustments to ensure recipe consistency
            iterativeResult.adjustments.forEach((adjustment) => {
                const ingredient = adjustedRecipe.ingredients.find(
                    (ri) => ri.ingredient.id === adjustment.ingredientId,
                );
                if (ingredient) {
                    // Ensure the recipe reflects the final adjusted amounts
                    ingredient.amount = adjustment.newAmount;
                    if (!ingredient.originalAmount) {
                        ingredient.originalAmount = adjustment.originalAmount;
                    }
                }
            });
        } else {
            adjustmentFeedback = 'Konnte Makroziele nicht perfekt erreichen';
        }
    }

    // Aktualisiere Gesamtwerte des Rezepts (this now reflects actual changes)
    adjustedRecipe.totalMacros = calculateRecipeMacros(adjustedRecipe);
    adjustedRecipe.totalCalories = calculateCaloriesFromMacros(
        adjustedRecipe.totalMacros,
    );

    return {
        adjustedRecipe,
        adjustments:
            adjustments.length > 0
                ? { success: true, data: adjustments }
                : { success: false, error: adjustmentFeedback },
    };
}
