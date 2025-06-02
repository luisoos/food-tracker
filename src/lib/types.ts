// Atwater-Faktoren
const PROTEIN_CALORIES_PER_GRAM = 4;
const CARBS_CALORIES_PER_GRAM = 4;
const FAT_CALORIES_PER_GRAM = 9;

// Standart Result Type
type Result<T, E = string> =
    | { success: true; data: T }
    | { success: false; error: E };

// Basistypen
interface Macros {
    protein: number; // Gramm Protein
    carbs: number; // Gramm Kohlenhydrate
    fat: number; // Gramm Fett
}

interface MacroGoal extends Macros {
    plusMinusPercentage: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    };
}

interface DailyGoal {
    calories: number; // Kalorienziel pro Tag
    macros: MacroGoal; // Makroziele pro Tag
}

// Zutatendefinition
interface Ingredient {
    id: string; // ID / Primary-Key
    name: string; // Name
    category: string; // Kategorie
    isFlexible: boolean; // Gibt an, ob die Zutat angepasst werden kann
    macrosPer100g: Macros; // Makros pro 100g
}

// Zutat in einem Rezept
interface RecipeIngredient {
    ingredient: Ingredient; // Referenz zur Zutat
    amount: number; // Menge in Gramm
    originalAmount?: number; // Ursprüngliche Menge (relevant bei Anpassungen)
}

// Rezeptdefinition
interface Recipe {
    id: string; // Eindeutige ID
    name: string; // Name des Rezepts
    ingredients: RecipeIngredient[]; // Liste der Zutaten
    totalMacros?: Macros; // Berechnete Gesamtmakros (optional)
    totalCalories?: number; // Berechnete Gesamtkalorien (optional)
}

// Mahlzeittypen
enum MealType {
    BREAKFAST = 'breakfast',
    LUNCH = 'lunch',
    DINNER = 'dinner',
}

// Mahlzeit
interface Meal {
    type: MealType; // Art der Mahlzeit
    recipe: Recipe; // Ausgewähltes Rezept
    adjustedIngredients?: RecipeIngredient[]; // Angepasste Zutaten
}

// Tagesplan
interface DailyPlan {
    date: string; // Datum im ISO-Format
    goal: DailyGoal; // Tagesziel
    meals: Meal[]; // Mahlzeiten des Tages
    totalMacros?: Macros; // Berechnete Gesamtmakros des Tages
    remainingMacros?: Macros; // Verbleibende Makros bis zum Tagesziel
}

// Einzelne Anpassung
type Adjustment = {
    ingredientId: string; // Referenz auf die Zutat
    macro: keyof Macros; // Dessen Makro
    amount: number; // Anzahl der Zutat
    efficiency: number; // Bewertungsindex, ob es Sinn macht, diese Zutat anzupassen
};

type ParentAdjustment = {
    ingredientId: string; // Referenz auf die Zutat
    originalAmount: number; // Eigentliche Menge
    newAmount: number; // Neue Menge
    reason: string; // Erklärung für die Anpassung
};

// Kombinierter Type für internes Feedback
type EvaluationResult = Result<Adjustment[], string>;

// Eingabe für den Anpassungsalgorithmus
interface AdjustmentInput {
    recipe: Recipe; // Das anzupassende Rezept
    changedIngredient?: RecipeIngredient; // Die vom Benutzer geänderte Zutat
    dailyPlan: DailyPlan; // Der aktuelle Tagesplan
    currentMealType: MealType;
}

// Ausgabe des Anpassungsalgorithmus
interface AdjustmentOutput {
    adjustedRecipe: Recipe; // Das angepasste Rezept
    adjustments: Result<ParentAdjustment[], string>;
}

export {
    PROTEIN_CALORIES_PER_GRAM,
    CARBS_CALORIES_PER_GRAM,
    FAT_CALORIES_PER_GRAM,
    MealType,
};

export type {
    Macros,
    DailyGoal,
    Ingredient,
    RecipeIngredient,
    Recipe,
    Meal,
    DailyPlan,
    Adjustment,
    ParentAdjustment,
    EvaluationResult,
    AdjustmentInput,
    AdjustmentOutput,
};
