import { DailyPlan, Macros, Meal, MealType } from '@/lib/types';
import { create } from 'zustand';
import { createDefaultDailyPlan } from '@/lib/defaults';

type Store = {
    dailyPlan: DailyPlan | null;
    setDailyPlan: (dailyPlan: DailyPlan) => void;
    loadDailyPlan: () => void;
    initializeDailyPlan: (date?: string) => void;
    addMeal: (meal: Meal) => void;
    removeMeal: (mealType: MealType) => void;
    updateTotalMacros: () => void;
};

const calculateTotalMacros = (meals: Meal[]): Macros => {
    return meals.reduce(
        (acc, meal) => {
            const recipe = meal.adjustedIngredients
                ? { ...meal.recipe, ingredients: meal.adjustedIngredients }
                : meal.recipe;

            recipe.ingredients.forEach(({ ingredient, amount }) => {
                const factor = amount / 100;
                acc.protein += ingredient.macrosPer100g.protein * factor;
                acc.carbs += ingredient.macrosPer100g.carbs * factor;
                acc.fat += ingredient.macrosPer100g.fat * factor;
            });
            return acc;
        },
        { protein: 0, carbs: 0, fat: 0 },
    );
};

export const useDailyPlanStore = create<Store>((set, get) => ({
    dailyPlan: null,
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
