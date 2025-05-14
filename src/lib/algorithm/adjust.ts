import { calculateMacroDifference, calculateRemainingMacros, isWithinGoal, calculateRecipeMacros, calculateCaloriesFromMacros, getMaxCompensation } from "./calculate";
import { findBestIngredientsToAdjust } from "./evaluate";

export default function adjustRecipe(input: AdjustmentInput): AdjustmentOutput {
    const { recipe, changedIngredient, dailyPlan, currentMealType } = input;

    // Erstelle eine Kopie des Originalrezepts für Anpassungen
    const adjustedRecipe: Recipe = JSON.parse(JSON.stringify(recipe));
    const adjustments: ParentAdjustment[] = [];

    const mealOrder: MealType[] = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER];
    const currentMealIndex = mealOrder.indexOf(currentMealType);
    const remainingMeals = mealOrder.slice(currentMealIndex + 1);

    // Fall 1: Benutzer hat Zutatenmenge manuell geändert
    if (changedIngredient) {
        const original = recipe.ingredients.find(
            (ri) => ri.ingredient.id === changedIngredient.ingredient.id,
        );

        if (!original) throw new Error('Zutat nicht gefunden');

        // Berechne Unterschied zwischen alter und neuer Menge
        const macroDiff = calculateMacroDifference(
            changedIngredient.ingredient,
            original.amount,
            changedIngredient.amount,
        );

        // Finde beste Ausgleichsmöglichkeiten
        const bestOptions = findBestIngredientsToAdjust(
            recipe,
            macroDiff,
            changedIngredient.ingredient.id,
        );

        // Übernehme die Top 3 Anpassungen
        bestOptions.slice(0, 3).forEach((option) => {
            const target = adjustedRecipe.ingredients.find(
                (ri) => ri.ingredient.id === option.ingredientId,
            );

            if (!target) return;

            const newAmount = Math.max(0, target.amount + option.amount);

            // Aktualisiere Zutat und speichere Originalwert
            target.amount = newAmount;
            target.originalAmount = target.amount;

            adjustments.push({
                ingredientId: option.ingredientId,
                originalAmount: target.amount,
                newAmount,
                reason: `${option.macro}-Ausgleich`,
            });
        });

        // Übernehme Benutzeränderung
        const changed = adjustedRecipe.ingredients.find(
            (ri) => ri.ingredient.id === changedIngredient.ingredient.id,
        );

        if (changed) {
            changed.amount = changedIngredient.amount;
            changed.originalAmount = original.amount;
        }
    }
    // Fall 2: Automatischer Ausgleich von Tagesdefiziten
    else {
        // Berechne fehlende/überschüssige Makros
        const remaining = calculateRemainingMacros(dailyPlan);
    
        // Dynamischer Kompensationsfaktor basierend auf verbleibenden Mahlzeiten
        const compensationFactor = remainingMeals.length > 0 
          ? 1 / (remainingMeals.length + 1) 
          : 1; // Letzte Mahlzeit muss vollständig kompensieren
    
        const adjustedDeficit = {
          protein: remaining.protein * compensationFactor,
          carbs: remaining.carbs * compensationFactor,
          fat: remaining.fat * compensationFactor
        };
    
        // Prüfung mit angepasster Toleranzlogik
        const canCompensateLater = (macro: keyof Macros, value: number) => {
          const maxFutureCompensation = remainingMeals.length * getMaxCompensation(macro);
          return Math.abs(value) <= maxFutureCompensation;
        };
    
        const needsAdjustment = Object.entries(adjustedDeficit).some(([macro, value]) => 
          !canCompensateLater(macro as keyof Macros, value)
        );
    
        if (!needsAdjustment) return { adjustedRecipe: recipe, adjustments: [] };
    
        // Anpassungslogik mit dynamischem Defizit
        const bestOptions = findBestIngredientsToAdjust(recipe, adjustedDeficit);

        // Übernehme Top 3 Anpassungen
        bestOptions.slice(0, 3).forEach((option) => {
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
    }

    // Aktualisiere Gesamtwerte des Rezepts
    adjustedRecipe.totalMacros = calculateRecipeMacros(adjustedRecipe);
    adjustedRecipe.totalCalories = calculateCaloriesFromMacros(
        adjustedRecipe.totalMacros,
    );

    return { adjustedRecipe, adjustments };
}
