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
import { Input } from '../ui/input';
import Macronutrients from './macro-view';
import { toGermanNumber } from '@/lib/utils';
import { useState } from 'react';

export default function IngredientList({ recipeId, onBack }: { recipeId: string, onBack: (data: string) => void }) {
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

    const [ amount, setAmount ] = useState<number | undefined>();
    const [ selectedIngredient, setSelectedIngredient ] = useState<string | undefined>();

    function changeIngredientAmount(value: number, ingredientId: string) {
        setAmount(value);
        setSelectedIngredient(ingredientId);
    }

    return (
        <div className='md:grid grid-cols-2 gap-8'>
            <Table className="max-w-xl">
                <TableBody>
                    {data.ingredients.map((ingredient, index) => (
                        <TableRow key={index}>
                            <TableCell className="flex text-center w-28"><Input className="p-0 h-8 w-16 text-center border-none shadow-none bg-zinc-300" type="number" onChange={(e) => changeIngredientAmount(Number(e.target.value), ingredient.ingredient.id)} defaultValue={ingredient.amount}></Input>g</TableCell>
                            <TableCell className="w-8 text-zinc-400">{toGermanNumber(ingredient.amount)}g</TableCell>
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
