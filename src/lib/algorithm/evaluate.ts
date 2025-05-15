import { Adjustment, Ingredient, Macros, Recipe } from '../types';

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
): Adjustment[] {
    const adjustments: Adjustment[] = [];

    // Bestimme, welche Makros kompensiert werden müssen (nur signifikante Unterschiede)
    const macrosToCompensate: (keyof Macros)[] = [];
    if (Math.abs(macroDifference.protein) > 1)
        macrosToCompensate.push('protein');
    if (Math.abs(macroDifference.carbs) > 1) macrosToCompensate.push('carbs');
    if (Math.abs(macroDifference.fat) > 1) macrosToCompensate.push('fat');

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

    // Sortiere Anpassungen nach Effizienz (höchste zuerst)
    return adjustments.sort((a, b) => b.efficiency - a.efficiency);
}
