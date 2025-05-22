import { DailyPlan, MealType } from './types';

const DEFAULT_MACRO_GOAL = {
    protein: 120, // grams
    carbs: 264, // grams
    fat: 85, // grams
    plusMinusPercentage: 10, // 10% deviation allowed
};

const DEFAULT_DAILY_GOAL = {
    calories: 2000, // kcal
    macros: DEFAULT_MACRO_GOAL,
};

export function createDefaultDailyPlan(date: string = new Date().toISOString().split('T')[0]): DailyPlan {
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