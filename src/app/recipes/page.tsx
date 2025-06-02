'use client';

import RecipeList from '@/components/tracker/recipe-list';

export default function RecipesPage() {

    const handleRecipeSelect = (recipeId: string) => {
        //
    };

    return (
        <div className="mt-6 mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8">Alle Rezepte</h1>
            <RecipeList onSelect={handleRecipeSelect} />
        </div>
    );
} 