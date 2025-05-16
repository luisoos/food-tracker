import { useQuery } from '@tanstack/react-query';
import { Recipe } from '@/lib/types';

export function useRecipe(id: string | undefined) {
    return useQuery<Recipe, Error>({
        queryKey: ['recipe', id],
        queryFn: async () => {
            if (!id) throw new Error('No recipe id provided');
            const res = await fetch(`/api/recipe/${id}`);
            if (!res.ok) throw new Error('Recipe not found');
            return res.json();
        },
        enabled: !!id,
    });
}
