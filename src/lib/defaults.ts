import { calculateCaloriesFromMacros } from './algorithm/calculate';
import { CARBS_TARGET, FAT_TARGET, PROTEIN_TARGET } from './recipes';
import { DailyPlan, MealType } from './types';

const DEFAULT_MACRO_GOAL = {
    protein: PROTEIN_TARGET, // grams
    carbs: CARBS_TARGET, // grams
    fat: FAT_TARGET, // grams
    plusMinusPercentage: {
        calories: 2.7, // ±60 kcal bei 2200 = 2.7%
        protein: 3.3, // ±5g bei 150g = 3.3%
        fat: 8.3, // ±5g bei 60g = 8.3%
        carbs: 5, // Standard-Toleranz für Kohlenhydrate
    },
};

const DEFAULT_DAILY_GOAL = {
    calories: calculateCaloriesFromMacros(DEFAULT_MACRO_GOAL), // kcal
    macros: DEFAULT_MACRO_GOAL,
};

export function createDefaultDailyPlan(
    date: string = new Date().toISOString().split('T')[0],
): DailyPlan {
    return {
        date,
        goal: DEFAULT_DAILY_GOAL,
        meals: [],
        totalMacros: {
            protein: 0,
            carbs: 0,
            fat: 0,
        },
        remainingMacros: {
            protein: DEFAULT_MACRO_GOAL.protein,
            carbs: DEFAULT_MACRO_GOAL.carbs,
            fat: DEFAULT_MACRO_GOAL.fat,
        },
    };
}
