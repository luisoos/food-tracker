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

export default function adjustRecipe(input: AdjustmentInput): AdjustmentOutput {
    const { recipe, changedIngredient, dailyPlan, currentMealType } = input;

    // Erstelle eine Kopie des Originalrezepts für Anpassungen
    const adjustedRecipe: Recipe = JSON.parse(JSON.stringify(recipe));
    const adjustments: ParentAdjustment[] = [];
    let adjustmentFeedback: string = 'Unbekannter Fehler';

    const mealOrder: MealType[] = [
        MealType.BREAKFAST,
        MealType.LUNCH,
        MealType.DINNER,
    ];
    const currentMealIndex = mealOrder.indexOf(currentMealType);
    const remainingMeals = mealOrder.slice(currentMealIndex + 1);

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

        console.log('Beste Optionen', bestOptions);

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

        console.log('Also Änderungen', adjustments);

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
        // Berechne fehlende/überschüssige Makros
        const remaining = calculateRemainingMacros(dailyPlan);

        // Dynamischer Kompensationsfaktor basierend auf verbleibenden Mahlzeiten
        const compensationFactor =
            remainingMeals.length > 0 ? 1 / (remainingMeals.length + 1) : 1; // Letzte Mahlzeit muss vollständig kompensieren

        const adjustedDeficit = {
            protein: remaining.protein * compensationFactor,
            carbs: remaining.carbs * compensationFactor,
            fat: remaining.fat * compensationFactor,
        };

        // Prüfung mit angepasster Toleranzlogik
        const canCompensateLater = (macro: keyof Macros, value: number) => {
            const maxFutureCompensation =
                remainingMeals.length * getMaxCompensation(macro);
            return Math.abs(value) <= maxFutureCompensation;
        };

        const needsAdjustment = Object.entries(adjustedDeficit).some(
            ([macro, value]) =>
                !canCompensateLater(macro as keyof Macros, value),
        );

        if (!needsAdjustment)
            return {
                adjustedRecipe: recipe,
                adjustments: {
                    success: false,
                    error: 'Du benötigst keine Anpassung für diese Mahlzeit.',
                },
            };

        // Anpassungslogik mit dynamischem Defizit
        const bestOptions = findBestIngredientsToAdjust(
            recipe,
            adjustedDeficit,
        );

        // Übernehme Top 3 Anpassungen
        if (bestOptions.success) {
            bestOptions.data.slice(0, 3).forEach((option) => {
                const target = adjustedRecipe.ingredients.find(
                    (ri) => ri.ingredient.id === option.ingredientId,
                );

                if (!target) return;

                const newAmount = Math.max(0, target.amount + option.amount);

                target.amount = newAmount;
                target.originalAmount = target.amount;

                adjustments.push({
                    ingredientId: option.ingredientId,
                    originalAmount: target.amount,
                    newAmount,
                    reason: `${option.macro}-Ausgleich vom Tag`,
                });
            });
        } else {
            adjustmentFeedback = bestOptions.error;
        }
    }

    // Aktualisiere Gesamtwerte des Rezepts
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
