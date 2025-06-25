import { DailyPlan, Macros, Meal, MealType } from '@/lib/types';
import { create } from 'zustand';
import { createDefaultDailyPlan } from '@/lib/defaults';
import { calculateRecipeMacros } from '@/lib/algorithm/calculate';

type Store = {
    dailyPlan: DailyPlan | null;
    setDailyPlan: (dailyPlan: DailyPlan) => void;
    loadDailyPlan: () => void;
    initializeDailyPlan: (date?: string) => void;
    addMeal: (meal: Meal) => void;
    editMeal: (meal: Meal) => void;
    removeMeal: (mealType: MealType) => void;
    updateTotalMacros: () => void;
};

const calculateTotalMacros = (meals: Meal[]): Macros => {
    return meals.reduce(
        (acc, meal) => {
            // Use the recipe's already calculated totalMacros
            if (meal.recipe.totalMacros) {
                acc.protein += meal.recipe.totalMacros.protein;
                acc.carbs += meal.recipe.totalMacros.carbs;
                acc.fat += meal.recipe.totalMacros.fat;
            } else {
                // Fallback: calculate from ingredients if totalMacros not available
                const recipe = meal.adjustedIngredients
                    ? { ...meal.recipe, ingredients: meal.adjustedIngredients }
                    : meal.recipe;

                const macros = calculateRecipeMacros(recipe);
                acc.protein += macros.protein;
                acc.carbs += macros.carbs;
                acc.fat += macros.fat;
            }
            return acc;
        },
        { protein: 0, carbs: 0, fat: 0 },
    );
};

const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || Date.now().toString();

function getInitialDailyPlan() {
    if (typeof window === 'undefined') return null;

    const storedId = localStorage.getItem('buildId');
    if (storedId !== BUILD_ID) {
        localStorage.clear();
        localStorage.setItem('buildId', BUILD_ID);
        return null; // or createDefaultDailyPlan();
    }
    const storedDailyPlan = localStorage.getItem('dailyPlan');
    return storedDailyPlan ? JSON.parse(storedDailyPlan) : null;
}

export const useDailyPlanStore = create<Store>((set, get) => ({
    dailyPlan: getInitialDailyPlan(),
    setDailyPlan: (dailyPlan) => {
        localStorage.setItem('dailyPlan', JSON.stringify(dailyPlan));
        set({ dailyPlan });
    },
    loadDailyPlan: () => {
        const storedDailyPlan = localStorage.getItem('dailyPlan');
        if (storedDailyPlan) {
            set({ dailyPlan: JSON.parse(storedDailyPlan) });
        } else {
            // Initialize with default plan if none exists
            const defaultPlan = createDefaultDailyPlan();
            localStorage.setItem('dailyPlan', JSON.stringify(defaultPlan));
            set({ dailyPlan: defaultPlan });
        }
    },
    initializeDailyPlan: (date) => {
        const defaultPlan = createDefaultDailyPlan(date);
        localStorage.setItem('dailyPlan', JSON.stringify(defaultPlan));
        set({ dailyPlan: defaultPlan });
    },
    addMeal: (meal) => {
        const currentPlan = get().dailyPlan;
        if (!currentPlan) return;

        const updatedPlan = {
            ...currentPlan,
            meals: [...currentPlan.meals, meal],
        };

        // Update total macros
        const totalMacros = calculateTotalMacros(updatedPlan.meals);
        updatedPlan.totalMacros = totalMacros;

        // Update remaining macros
        updatedPlan.remainingMacros = {
            protein: currentPlan.goal.macros.protein - totalMacros.protein,
            carbs: currentPlan.goal.macros.carbs - totalMacros.carbs,
            fat: currentPlan.goal.macros.fat - totalMacros.fat,
        };

        get().setDailyPlan(updatedPlan);
    },
    editMeal: (meal) => {
        const currentPlan = get().dailyPlan;
        if (!currentPlan) return;

        // Remove the old meal of the same type and add the new one
        const updatedPlan = {
            ...currentPlan,
            meals: [
                ...currentPlan.meals.filter((m) => m.type !== meal.type),
                meal,
            ],
        };

        // Update total macros
        const totalMacros = calculateTotalMacros(updatedPlan.meals);
        updatedPlan.totalMacros = totalMacros;

        // Update remaining macros
        updatedPlan.remainingMacros = {
            protein: currentPlan.goal.macros.protein - totalMacros.protein,
            carbs: currentPlan.goal.macros.carbs - totalMacros.carbs,
            fat: currentPlan.goal.macros.fat - totalMacros.fat,
        };

        get().setDailyPlan(updatedPlan);
    },
    removeMeal: (mealType) => {
        const currentPlan = get().dailyPlan;
        if (!currentPlan) return;

        const updatedPlan = {
            ...currentPlan,
            meals: currentPlan.meals.filter((meal) => meal.type !== mealType),
        };

        // Update total macros
        const totalMacros = calculateTotalMacros(updatedPlan.meals);
        updatedPlan.totalMacros = totalMacros;

        // Update remaining macros
        updatedPlan.remainingMacros = {
            protein: currentPlan.goal.macros.protein - totalMacros.protein,
            carbs: currentPlan.goal.macros.carbs - totalMacros.carbs,
            fat: currentPlan.goal.macros.fat - totalMacros.fat,
        };

        get().setDailyPlan(updatedPlan);
    },
    updateTotalMacros: () => {
        const currentPlan = get().dailyPlan;
        if (!currentPlan) return;

        const totalMacros = calculateTotalMacros(currentPlan.meals);
        const updatedPlan = {
            ...currentPlan,
            totalMacros,
            remainingMacros: {
                protein: currentPlan.goal.macros.protein - totalMacros.protein,
                carbs: currentPlan.goal.macros.carbs - totalMacros.carbs,
                fat: currentPlan.goal.macros.fat - totalMacros.fat,
            },
        };

        get().setDailyPlan(updatedPlan);
    },
}));
