import { useRecipe } from '@/hooks/useRecipeById';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Macronutrients from './macro-view';

export default function IngredientList({ recipeId }: { recipeId: string }) {
    const { data, isLoading, error } = useRecipe(recipeId);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!data) return <div>No recipe selected!</div>;

    const totalMacros = data.ingredients.reduce(
        (acc, ingredient) => {
            const factor = ingredient.amount / 100;
            acc.carbs += ingredient.ingredient.macrosPer100g.carbs * factor;
            acc.protein += ingredient.ingredient.macrosPer100g.protein * factor;
            acc.fat += ingredient.ingredient.macrosPer100g.fat * factor;
            return acc;
        },
        { carbs: 0, protein: 0, fat: 0 },
    );

    return (
        <div className='flex'>
            <Table>
                <TableBody>
                    {data.ingredients.map((ingredient, index) => (
                        <TableRow key={index}>
                            <TableCell>{ingredient.amount}</TableCell>
                            <TableCell>{ingredient.amount}</TableCell>
                            <TableCell className='font-medium'>
                                {ingredient.ingredient.name}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Macronutrients
                carbs={totalMacros.carbs}
                protein={totalMacros.protein}
                fat={totalMacros.fat}
            />
        </div>
    );
}
