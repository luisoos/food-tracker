// Atwater-Faktoren
const PROTEIN_CALORIES_PER_GRAM = 4;
const CARBS_CALORIES_PER_GRAM = 4;
const FAT_CALORIES_PER_GRAM = 9;

// Basistypen
interface Macros {
  protein: number;      // Gramm Protein
  carbs: number;        // Gramm Kohlenhydrate
  fat: number;          // Gramm Fett
}

interface MacroGoal extends Macros {
  plusMinusPercentage: number;  // Erlaubte Abweichung in Prozent
}

interface DailyGoal {
  calories: number;     // Gesamtkalorienziel pro Tag
  macros: MacroGoal;    // Makronährstoffziele pro Tag
}

// Zutatendefinition
interface Ingredient {
  id: string;           // Eindeutige ID
  name: string;         // Name der Zutat
  category: string;     // Kategorie (z.B. "Gemüse", "Protein", "Kohlenhydrate")
  isFlexible: boolean;  // Gibt an, ob die Zutat angepasst werden kann
  macrosPer100g: Macros; // Makronährstoffe pro 100g
}

// Zutat in einem Rezept
interface RecipeIngredient {
  ingredient: Ingredient; // Referenz zur Zutat
  amount: number;        // Menge in Gramm
  originalAmount?: number; // Ursprüngliche Menge (relevant bei Anpassungen)
}

// Rezeptdefinition
interface Recipe {
  id: string;           // Eindeutige ID
  name: string;         // Name des Rezepts
  ingredients: RecipeIngredient[]; // Liste der Zutaten
  totalMacros?: Macros; // Berechnete Gesamtmakros (optional)
  totalCalories?: number; // Berechnete Gesamtkalorien (optional)
}

// Mahlzeittypen
enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner'
}

// Mahlzeit
interface Meal {
  type: MealType;       // Art der Mahlzeit 
  recipe: Recipe;       // Ausgewähltes Rezept
  adjustedIngredients?: RecipeIngredient[]; // Angepasste Zutaten
}

// Tagesplan
interface DailyPlan {
  date: string;         // Datum im ISO-Format
  goal: DailyGoal;      // Tagesziel
  meals: Meal[];        // Mahlzeiten des Tages
  totalMacros?: Macros; // Berechnete Gesamtmakros des Tages
  remainingMacros?: Macros; // Verbleibende Makros bis zum Tagesziel
}

// Eingabe für den Anpassungsalgorithmus
interface AdjustmentInput {
  recipe: Recipe;       // Das anzupassende Rezept
  changedIngredient?: RecipeIngredient; // Die vom Benutzer geänderte Zutat
  dailyPlan: DailyPlan; // Der aktuelle Tagesplan
}

// Ausgabe des Anpassungsalgorithmus
interface AdjustmentOutput {
  adjustedRecipe: Recipe; // Das angepasste Rezept
  adjustments: {
    ingredientId: string;
    originalAmount: number;
    newAmount: number;
    reason: string;     // Erklärung für die Anpassung
  }[];
}
