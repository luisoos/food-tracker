import { ReactNode, useCallback, useEffect, useState } from 'react';
import {
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
    Drawer,
} from '../ui/drawer';
import { Button } from '../ui/button';
import IngredientList from './ingredient-list';
import RecipeList from './recipe-list';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Ban, Plus } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { DailyPlan, Macros, MealType, Recipe } from '@/lib/types';
import { useDailyPlanStore } from '@/stores/daily-tracker';
import { useRecipe } from '@/hooks/useRecipeById';

interface RecipeSelectorProps {
    typeName: string;
    children: ReactNode;
    currentMealType: MealType;
}

export default function RecipeSelector({
    typeName,
    children,
    currentMealType,
}: RecipeSelectorProps) {
    const dailyPlan = useDailyPlanStore((state) => state.dailyPlan);
    const addMeal = useDailyPlanStore((state) => state.addMeal);
    const [recipeId, setRecipeId] = useState<string | undefined>(undefined);
    const [recipeName, setRecipeName] = useState<string | undefined>(undefined);
    const { data: recipe } = useRecipe(recipeId || '');
    const [recipeWithUpdatedMacros, setRecipeWithUpdatedMacros] =
        useState<Recipe>();

    const currentRecipe = recipeWithUpdatedMacros || recipe;

    const handleRecipeSelection = (recipeId: string) => {
        setRecipeId(recipeId);
    };

    const resetRecipeSelection = () => {
        setRecipeId(undefined);
    };

    const handleAddMeal = () => {
        if (!currentRecipe || !dailyPlan) return;

        addMeal({
            type: currentMealType,
            recipe: currentRecipe,
        });

        resetRecipeSelection();
    };

    const updateRecipeUsingDynamicValue = useCallback(
        (macros: Macros, totalCalories: number) => {
            if (!recipe) return;

            const updatedRecipe: Recipe = {
                ...recipe,
                totalMacros: macros,
                totalCalories: totalCalories,
            };

            setRecipeWithUpdatedMacros(updatedRecipe);
        },
        [recipe],
    );

    const scrollAreaSize = 400;

    return (
        <Drawer onClose={() => resetRecipeSelection()}>
            <DrawerTrigger className='w-full h-full cursor-pointer'>
                {children}
            </DrawerTrigger>
            <DrawerContent
                style={{ height: `${scrollAreaSize + 122}px` }}
                className='md:px-32 xl:px-72 2xl:px-96'>
                <DrawerHeader className='pb-0'>
                    <DrawerTitle className='text-xl'>
                        <RecipeDrawerTitle
                            typeName={typeName}
                            recipeName={recipe?.name}
                        />
                    </DrawerTitle>
                    <AnimatePresence mode='wait'>
                        {!recipeId ? (
                            <motion.div
                                key='recipe-list'
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}>
                                <DrawerClose asChild>
                                    <button
                                        onClick={() => setRecipeId(undefined)}
                                        className='cursor-pointer flex items-center gap-2 text-sm font-medium pl-0 mr-auto mb-2 underline-offset-4 hover:underline'>
                                        <ArrowLeft size={16} /> Zurück zur
                                        Tagesübersicht
                                    </button>
                                </DrawerClose>
                                <DrawerDescription>
                                    Wähle ein Rezept aus:
                                </DrawerDescription>
                                <ScrollArea
                                    style={{ height: `${scrollAreaSize}px` }}
                                    className='pr-4 z-10'>
                                    <RecipeList
                                        onSelect={handleRecipeSelection}
                                    />
                                </ScrollArea>
                            </motion.div>
                        ) : (
                            <motion.div
                                key='ingredient-list'
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}>
                                <button
                                    onClick={() => setRecipeId(undefined)}
                                    className='cursor-pointer flex items-center gap-2 text-sm font-medium pl-0 mr-auto mb-2 underline-offset-4 hover:underline'>
                                    <ArrowLeft size={16} /> Zurück zur
                                    Rezeptauswahl
                                </button>
                                <DrawerDescription>Zutaten:</DrawerDescription>
                                <IngredientList
                                    recipeId={recipeId!}
                                    dailyPlan={dailyPlan}
                                    currentMealType={currentMealType}
                                    onMacrosUpdate={
                                        updateRecipeUsingDynamicValue
                                    }
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DrawerHeader>
                {recipeId && (
                    <DrawerFooter className='flex flex-row justify-between'>
                        <DrawerClose asChild>
                            <Button variant='outline' className='mr-2'>
                                <Ban /> Abbrechen
                            </Button>
                        </DrawerClose>
                        <Button
                            variant='default'
                            className='ml-2'
                            onClick={handleAddMeal}>
                            <Plus /> Hinzufügen
                        </Button>
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    );
}

function RecipeDrawerTitle({
    typeName,
    recipeName,
}: {
    typeName: string;
    recipeName: string | undefined;
}) {
    return (
        <div className='flex items-center'>
            <span>{typeName} hinzufügen</span>
            <AnimatePresence mode='wait'>
                {recipeName && (
                    <motion.span
                        key={recipeName}
                        initial={{
                            y: 30,
                            opacity: 0,
                            scale: 0.9,
                        }}
                        animate={{
                            y: 0,
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            y: -20,
                            opacity: 0,
                            scale: 0.9,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 20,
                            duration: 0.6,
                        }}>
                        : {recipeName}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}
