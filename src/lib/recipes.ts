import { Ingredient, Recipe } from './types';

// Hard-gecodete Rezepte als Beispiele
// Zutaten
const ingredients: Record<string, Ingredient> = {
    chicken: {
        id: 'chicken',
        name: 'Hähnchenfilet',
        category: 'Protein',
        isFlexible: true,
        macrosPer100g: { protein: 23.0, carbs: 0.0, fat: 1.5 },
    },
    rice: {
        id: 'rice',
        name: 'Reis',
        category: 'Kohlenhydrate',
        isFlexible: true,
        macrosPer100g: { protein: 2.7, carbs: 28.0, fat: 0.3 },
    },
    broccoli: {
        id: 'broccoli',
        name: 'Brokkoli',
        category: 'Gemüse',
        isFlexible: true,
        macrosPer100g: { protein: 2.8, carbs: 7.0, fat: 0.4 },
    },
    oliveoil: {
        id: 'oliveoil',
        name: 'Olivenöl',
        category: 'Fette',
        isFlexible: true,
        macrosPer100g: { protein: 0.0, carbs: 0.0, fat: 100.0 },
    },
};

// Beispiel-Rezepte
export const recipes: Record<string, Recipe> = {
    chickenRiceBowl: {
        id: 'chicken_rice_bowl',
        name: 'Hähnchen-Reis-Bowl',
        ingredients: [
            { ingredient: ingredients.chicken, amount: 200 },
            { ingredient: ingredients.rice, amount: 150 },
            { ingredient: ingredients.broccoli, amount: 100 },
            { ingredient: ingredients.oliveoil, amount: 10 },
        ],
    },
    // Weitere Rezepte...
};
