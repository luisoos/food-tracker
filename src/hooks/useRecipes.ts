import { useQuery } from '@tanstack/react-query';

const fetchRecipes = async () => {
    const response = await fetch('/api/recipe');

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
};

export function useRecipes() {
    return useQuery({
        queryKey: ['recipes'],
        queryFn: fetchRecipes,
    });
}
