import { NextRequest, NextResponse } from 'next/server';
import adjustRecipe from '@/lib/algorithm/adjust';
import { z } from 'zod';
import { MealType } from '@/lib/types';

// Schema for consumed macros (must be positive)
const MacrosSchema = z.object({
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
});

// Schema for remaining macros (can be negative)
const RemainingMacrosSchema = z.object({
    protein: z.number(), // Can be negative
    carbs: z.number(), // Can be negative
    fat: z.number(), // Can be negative
});

const MacroGoalSchema = MacrosSchema.extend({
    plusMinusPercentage: z.object({
        calories: z.number().min(0).max(100),
        protein: z.number().min(0).max(100),
        fat: z.number().min(0).max(100),
        carbs: z.number().min(0).max(100),
    }),
});

const DailyGoalSchema = z.object({
    calories: z.number().min(0),
    macros: MacroGoalSchema,
});

const IngredientSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    isFlexible: z.boolean(),
    macrosPer100g: MacrosSchema,
});

const RecipeIngredientSchema = z.object({
    ingredient: IngredientSchema,
    amount: z.number().min(0),
    originalAmount: z.number().min(0).optional(),
});

const RecipeSchema = z.object({
    id: z.string(),
    name: z.string(),
    ingredients: z.array(RecipeIngredientSchema),
    totalMacros: MacrosSchema.optional(),
    totalCalories: z.number().min(0).optional(),
});

const MealTypeSchema = z
    .enum(['breakfast', 'lunch', 'dinner'])
    .transform((val) => {
        if (val === 'breakfast') return MealType.BREAKFAST;
        if (val === 'lunch') return MealType.LUNCH;
        return MealType.DINNER;
    });

const MealSchema = z.object({
    type: MealTypeSchema,
    recipe: RecipeSchema,
    adjustedIngredients: z.array(RecipeIngredientSchema).optional(),
});

const DailyPlanSchema = z.object({
    date: z.string(),
    goal: DailyGoalSchema,
    meals: z.array(MealSchema),
    totalMacros: MacrosSchema.optional(), // Must be positive
    remainingMacros: RemainingMacrosSchema.optional(), // Can be negative
});

const AdjustmentInputSchema = z.object({
    recipe: RecipeSchema,
    changedIngredient: RecipeIngredientSchema.optional(),
    dailyPlan: DailyPlanSchema,
    currentMealType: MealTypeSchema,
});

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.json();

        const validationResult = AdjustmentInputSchema.safeParse(rawBody);
        console.log(rawBody);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Invalid input',
                    details: validationResult.error.flatten(),
                },
                { status: 400 },
            );
        }

        // Typensichere Daten nach Validierung
        const validatedData = validationResult.data;

        // Algorithmus aufrufen
        const result = adjustRecipe(validatedData);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
