import {
    calculateCaloriesFromMacros,
    calculateRecipeMacros,
    isWithinGoal,
} from './calculate';
import {
    Recipe,
    Macros,
    DailyPlan,
    MealType,
    DailyGoal,
    ParentAdjustment,
    MacrosWithCalories,
} from '@/lib/types';

export default function adjustRecipeIteratively(
    recipe: Recipe,
    targetContribution: Macros,
    dailyPlan: DailyPlan,
    maxIterations: number = 15,
): { adjustments: ParentAdjustment[]; success: boolean } {
    const adjustedRecipe = JSON.parse(JSON.stringify(recipe)) as Recipe;
    const adjustments: Map<string, ParentAdjustment> = new Map();

    // Lock original amounts
    adjustedRecipe.ingredients.forEach((ri) => {
        if (!ri.originalAmount) ri.originalAmount = ri.amount;
    });

    const isLastMeal =
        dailyPlan.meals.length === Object.keys(MealType).length - 1;
    let previousTotalError = Infinity;
    let totalError = Infinity;
    let stagnationCount = 0;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        const currentMacros = calculateRecipeMacros(adjustedRecipe);
        const projectedDaily = calculateProjectedDaily(
            adjustedRecipe,
            dailyPlan,
        );

        // Calculate total error for progress tracking
        const errors = {
            protein: Math.abs(
                currentMacros.protein - targetContribution.protein,
            ),
            carbs: Math.abs(currentMacros.carbs - targetContribution.carbs),
            fat: Math.abs(currentMacros.fat - targetContribution.fat),
        };

        totalError =
            (errors.protein + errors.carbs + errors.fat) /
            (targetContribution.protein +
                targetContribution.carbs +
                targetContribution.fat);

        // Enhanced convergence check
        if (errors.protein <= 3 && errors.carbs <= 3 && errors.fat <= 3) {
            if (isWithinCalorieBounds(projectedDaily, dailyPlan.goal)) {
                return {
                    adjustments: Array.from(adjustments.values()),
                    success: true,
                };
            }
        }

        // Anti-oscillation: Check for progress stagnation
        if (Math.abs(totalError - previousTotalError) < 0.01) {
            stagnationCount++;
            if (stagnationCount >= 3) {
                // Accept current result if reasonable progress made
                if (
                    totalError < 0.3 ||
                    isWithinCalorieBounds(projectedDaily, dailyPlan.goal)
                ) {
                    return {
                        adjustments: Array.from(adjustments.values()),
                        success: true,
                    };
                }
                break;
            }
        } else {
            stagnationCount = 0;
        }
        previousTotalError = totalError;

        // Enhanced macro targeting with adaptive damping
        const bestAdjustment = findBestMacroAdjustmentWithAdaptiveDamping(
            adjustedRecipe,
            targetContribution,
            currentMacros,
            iteration,
        );

        if (!bestAdjustment) break;

        // Apply adjustment
        const ingredient = adjustedRecipe.ingredients.find(
            (ri) => ri.ingredient.id === bestAdjustment.ingredientId,
        );
        if (ingredient) {
            ingredient.amount = bestAdjustment.newAmount;
            adjustments.set(bestAdjustment.ingredientId, bestAdjustment);
        }
    }

    // Enhanced fallback evaluation
    const finalProjected = calculateProjectedDaily(adjustedRecipe, dailyPlan);
    const hasProgress = adjustments.size > 0;
    const withinBounds = isWithinCalorieBounds(finalProjected, dailyPlan.goal);

    // If macro optimization failed, try calorie-first fallback
    if (!hasProgress || !withinBounds) {
        console.log(
            '🔥 MACRO OPTIMIZATION FAILED - ACTIVATING CALORIE FALLBACK',
        );

        const calorieDeficit = calculateCalorieDeficit(
            adjustedRecipe,
            dailyPlan,
        );
        const fallbackResult = executeCalorieFirstFallback(
            recipe, // Use original recipe as starting point
            dailyPlan,
            Math.abs(calorieDeficit),
        );

        if (fallbackResult.success) {
            console.log('✅ CALORIE FALLBACK SUCCEEDED');
            return fallbackResult;
        }
    }

    return {
        adjustments: Array.from(adjustments.values()),
        success: hasProgress && (withinBounds || totalError < 0.4),
    };
}

function findBestMacroAdjustmentWithAdaptiveDamping(
    recipe: Recipe,
    targetContribution: Macros,
    currentMacros: Macros,
    iteration: number,
): ParentAdjustment | null {
    const deficits = {
        protein: targetContribution.protein - currentMacros.protein,
        carbs: targetContribution.carbs - currentMacros.carbs,
        fat: targetContribution.fat - currentMacros.fat,
    };

    // Find most critical macro with weighted scoring
    const criticalMacro = (['protein', 'carbs', 'fat'] as const)
        .map((macro) => ({
            macro,
            deficit: deficits[macro],
            abs: Math.abs(deficits[macro]),
            priority: macro === 'carbs' ? 1.2 : 1.0, // Slight carb priority for this recipe
        }))
        .filter((item) => item.abs > 2.0)
        .sort((a, b) => b.abs * b.priority - a.abs * a.priority)[0];

    if (!criticalMacro) return null;

    // Adaptive damping: more aggressive in early iterations
    const adaptiveDamping = Math.max(0.3, 0.9 - iteration * 0.05);

    // Find best ingredient with constraint awareness
    const scored = recipe.ingredients
        .filter((ri) => ri.ingredient.isFlexible)
        .map((ri) => {
            const macroContent =
                ri.ingredient.macrosPer100g[criticalMacro.macro];
            const originalAmount = ri.originalAmount!;

            const canIncrease =
                criticalMacro.deficit > 0 &&
                macroContent > 0 &&
                ri.amount < originalAmount * 2.5;
            const canDecrease =
                criticalMacro.deficit < 0 &&
                macroContent > 0 &&
                ri.amount > originalAmount * 0.1;

            if (!canIncrease && !canDecrease) return null;

            // Efficiency score considering constraint headroom
            const constraintRoom =
                criticalMacro.deficit > 0
                    ? (originalAmount * 2.5 - ri.amount) / originalAmount
                    : (ri.amount - originalAmount * 0.1) / originalAmount;

            return {
                ingredient: ri,
                score: Math.abs(macroContent) * constraintRoom,
                macroContent,
            };
        })
        .filter((item) => item !== null)
        .sort((a, b) => b.score - a.score);

    if (scored.length === 0) return null;

    const best = scored[0].ingredient;
    const originalAmount = best.originalAmount!;
    const macroContent = scored[0].macroContent;

    // Calculate adjustment with adaptive damping
    const targetAmountChange = (criticalMacro.deficit / macroContent) * 100;
    const dampedChange = targetAmountChange * adaptiveDamping;

    const minAmount = originalAmount * 0.1;
    const maxAmount = originalAmount * 2.5;
    const newAmount = Math.max(
        minAmount,
        Math.min(maxAmount, best.amount + dampedChange),
    );

    if (Math.abs(newAmount - best.amount) < 0.5) return null;

    return {
        ingredientId: best.ingredient.id,
        originalAmount,
        newAmount,
        reason: 'Automatische Feinjustierung zur optimalen Makroverteilung',
    };
}

// Helper function remains the same
function isWithinCalorieBounds(
    projectedDaily: MacrosWithCalories,
    goal: DailyGoal,
): boolean {
    const calorieMargin =
        (goal.calories * goal.macros.plusMinusPercentage.calories) / 100;
    return (
        projectedDaily.calories >= goal.calories - calorieMargin &&
        projectedDaily.calories <= goal.calories + calorieMargin
    );
}

// Helper functions remain the same...
function calculateCalorieDeficit(recipe: Recipe, dailyPlan: DailyPlan): number {
    const currentRecipeCalories = calculateCaloriesFromMacros(
        calculateRecipeMacros(recipe),
    );
    const existingCalories = dailyPlan.meals.reduce(
        (sum, meal) =>
            sum +
            calculateCaloriesFromMacros(calculateRecipeMacros(meal.recipe)),
        0,
    );
    return dailyPlan.goal.calories - (existingCalories + currentRecipeCalories);
}

function calculateProjectedDaily(recipe: Recipe, dailyPlan: DailyPlan) {
    // Use the already-calculated daily totals instead of recalculating
    const existingMacros = dailyPlan.totalMacros || {
        protein: 0,
        carbs: 0,
        fat: 0,
    };

    const recipeContribution = calculateRecipeMacros(recipe);

    const totalMacros = {
        protein: existingMacros.protein + recipeContribution.protein,
        carbs: existingMacros.carbs + recipeContribution.carbs,
        fat: existingMacros.fat + recipeContribution.fat,
    };

    return {
        ...totalMacros,
        calories: calculateCaloriesFromMacros(totalMacros),
    };
}

function executeCalorieFirstFallback(
    recipe: Recipe,
    dailyPlan: DailyPlan,
    _unusedParam: number, // Ignore the macro-derived parameter
): { adjustments: ParentAdjustment[]; success: boolean } {
    // Check if this is the last meal of the day
    const isLastMeal =
        dailyPlan.meals.length === Object.keys(MealType).length - 1;

    // Only proceed with calorie-first fallback for the last meal
    if (!isLastMeal) {
        console.log('⚠️ CALORIE-FIRST FALLBACK SKIPPED - NOT LAST MEAL');
        return {
            adjustments: [],
            success: false,
        };
    }

    const adjustedRecipe = JSON.parse(JSON.stringify(recipe)) as Recipe;
    const adjustments: Map<string, ParentAdjustment> = new Map();

    console.log('=== CALORIE-FIRST FALLBACK ACTIVATED ===');

    // Lock original amounts
    adjustedRecipe.ingredients.forEach((ri) => {
        if (!ri.originalAmount) ri.originalAmount = ri.amount;
    });

    const MAX_FALLBACK_ITERATIONS = 15;

    for (let iteration = 0; iteration < MAX_FALLBACK_ITERATIONS; iteration++) {
        const projectedDaily = calculateProjectedDaily(
            adjustedRecipe,
            dailyPlan,
        );
        console.log(
            adjustedRecipe,
            calculateRecipeMacros(adjustedRecipe),
            calculateCaloriesFromMacros(calculateRecipeMacros(adjustedRecipe)),
            projectedDaily,
        );
        console.log(
            `Iteration ${iteration + 1}: Daily total ${projectedDaily.calories.toFixed(1)} kcal`,
        );

        // Check if within acceptable calorie range (THIS IS THE REAL TARGET)
        if (isWithinCalorieBounds(projectedDaily, dailyPlan.goal)) {
            console.log('✅ DAILY CALORIE TARGET ACHIEVED!');
            return {
                adjustments: Array.from(adjustments.values()),
                success: true,
            };
        }

        // Calculate ACTUAL daily deficit (not macro-derived)
        const actualDailyDeficit =
            dailyPlan.goal.calories - projectedDaily.calories;

        console.log(`Daily deficit: ${actualDailyDeficit.toFixed(1)} kcal`);

        // Find most calorie-efficient adjustment
        const bestAdjustment = findMostCalorieEfficientAdjustment(
            adjustedRecipe,
            actualDailyDeficit,
        );

        if (!bestAdjustment) {
            console.log('❌ No further calorie adjustments possible');
            break;
        }

        // Apply adjustment
        const ingredient = adjustedRecipe.ingredients.find(
            (ri) => ri.ingredient.id === bestAdjustment.ingredientId,
        );

        if (ingredient) {
            console.log(
                `🔥 CALORIE-FIRST: ${bestAdjustment.ingredientId} ${ingredient.amount}g → ${bestAdjustment.newAmount}g`,
            );
            ingredient.amount = bestAdjustment.newAmount;
            adjustments.set(bestAdjustment.ingredientId, bestAdjustment);
        }
    }

    // Final evaluation - accept if within calorie bounds regardless of macros
    const finalProjected = calculateProjectedDaily(adjustedRecipe, dailyPlan);
    const withinCalorieBounds = isWithinCalorieBounds(
        finalProjected,
        dailyPlan.goal,
    );

    console.log(`Final calorie bounds check: ${withinCalorieBounds}`);
    console.log(
        `Final daily total: ${finalProjected.calories.toFixed(1)} kcal`,
    );

    return {
        adjustments: Array.from(adjustments.values()),
        success: withinCalorieBounds,
    };
}

function findMostCalorieEfficientAdjustment(
    recipe: Recipe,
    calorieDeficit: number,
): ParentAdjustment | null {
    // Rank ingredients by calorie density (kcal per gram)
    const rankedIngredients = recipe.ingredients
        .filter((ri) => ri.ingredient.isFlexible)
        .map((ri) => {
            const macros = ri.ingredient.macrosPer100g;
            const caloriesPer100g = calculateCaloriesFromMacros(macros);
            const calorieDensity = caloriesPer100g / 100; // kcal per gram
            const originalAmount = ri.originalAmount!;

            // Calculate adjustment capacity
            const maxIncrease = originalAmount * 2.5 - ri.amount;
            const maxDecrease = ri.amount - originalAmount * 0.1;

            const canIncrease = calorieDeficit > 0 && maxIncrease > 0;
            const canDecrease = calorieDeficit < 0 && maxDecrease > 0;

            if (!canIncrease && !canDecrease) return null;

            return {
                ingredient: ri,
                calorieDensity,
                adjustmentCapacity:
                    calorieDeficit > 0 ? maxIncrease : maxDecrease,
                score:
                    calorieDensity *
                    (calorieDeficit > 0 ? maxIncrease : maxDecrease),
            };
        })
        .filter((item) => item !== null)
        .sort((a, b) => b.score - a.score);

    if (rankedIngredients.length === 0) return null;

    const best = rankedIngredients[0];
    const ingredient = best.ingredient;
    const originalAmount = ingredient.originalAmount!;

    // Calculate aggressive calorie-focused adjustment
    const targetAmountChange = Math.abs(calorieDeficit) / best.calorieDensity;
    const direction = calorieDeficit > 0 ? 1 : -1;
    const actualChange =
        Math.min(targetAmountChange, best.adjustmentCapacity) * direction;

    const minAmount = originalAmount * 0.1;
    const maxAmount = originalAmount * 2.5;
    const newAmount = Math.max(
        minAmount,
        Math.min(maxAmount, ingredient.amount + actualChange),
    );

    if (Math.abs(newAmount - ingredient.amount) < 0.5) return null;

    return {
        ingredientId: ingredient.ingredient.id,
        originalAmount,
        newAmount,
        reason: 'Kalorien-Tagesausgleich',
    };
}
