import { Adjustment, EvaluationResult, Ingredient, Macros, Recipe } from '../types';

// Berechnet die "Effizienz" einer Zutat für die Bereitstellung eines bestimmten Makros
export function calculateIngredientEfficiency(
    ingredient: Ingredient,
    targetMacro: keyof Macros,
): number {
    const macrosPer100g = ingredient.macrosPer100g;
    const totalMacrosIn100g =
        macrosPer100g.protein + macrosPer100g.carbs + macrosPer100g.fat;

    if (totalMacrosIn100g === 0) return 0;

    // Effizienz ist das Verhältnis des Zielmakros zu Gesamtmakros
    return macrosPer100g[targetMacro] / totalMacrosIn100g;
}

// Findet die besten Zutaten zur Anpassung, um eine Makrodifferenz zu kompensieren
export function findBestIngredientsToAdjust(
    recipe: Recipe,
    macroDifference: Macros,
    excludeIngredientId?: string,
): EvaluationResult {
    const adjustments: Adjustment[] = [];

    // Bestimme, welche Makros kompensiert werden müssen (nur signifikante Unterschiede)
    const macrosToCompensate: (keyof Macros)[] = [];
    if (Math.abs(macroDifference.protein) > 1)
        macrosToCompensate.push('protein');
    if (Math.abs(macroDifference.carbs) > 1) macrosToCompensate.push('carbs');
    if (Math.abs(macroDifference.fat) > 1) macrosToCompensate.push('fat');

    // Wenn keine Makros zu kompensieren sind, gib Feedback zurück
    if (macrosToCompensate.length === 0) {
        return {
            success: false,
            error: "Die Änderung ist zu gering, um eine Anpassung zu rechtfertigen."
        };
    }

    console.log("Macros zu kompensieren", macrosToCompensate)
    // Für jede flexible Zutat (außer der geänderten)
    recipe.ingredients
        .filter(
            (ri) =>
                ri.ingredient.isFlexible &&
                ri.ingredient.id !== excludeIngredientId,
        )
        .forEach((ri) => {
            macrosToCompensate.forEach((macro) => {
                if (ri.ingredient.macrosPer100g[macro] === 0) return;

                const macroPerGram = ri.ingredient.macrosPer100g[macro] / 100;
                const direction = macroDifference[macro] < 0 ? 1 : -1;
                const requiredAmount =
                    Math.abs(macroDifference[macro] / macroPerGram) * direction;
                
                // Menge begrenzen (max. 250% der Originalmenge)
                const MAX_ADJUSTMENT_FACTOR = 2.5;
                const originalAmount = ri.amount;
                const clampedAmount = Math.max(
                    -originalAmount * MAX_ADJUSTMENT_FACTOR,
                    Math.min(
                        requiredAmount,
                        originalAmount * MAX_ADJUSTMENT_FACTOR
                    )
                );

                if (Math.abs(clampedAmount) < 1) return; // Minimale Änderung ignorieren

                const efficiency = calculateIngredientEfficiency(
                    ri.ingredient,
                    macro,
                );

                adjustments.push({
                    ingredientId: ri.ingredient.id,
                    macro,
                    amount: requiredAmount,
                    efficiency,
                });
            });
        });

    // Wenn keine sinnvollen Anpassungen gefunden wurden
    if (adjustments.length === 0) {
        return {
            success: false,
            error: "Keine sinnvollen Anpassungen möglich. Die erforderlichen Änderungen wären zu extrem."
        };
    }

    // Sortiere Anpassungen nach Effizienz (höchste zuerst)
    return {
        success: true,
        data: adjustments.sort((a, b) => b.efficiency - a.efficiency),
    };
}
