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
import { ArrowLeft, Ban, Plus, SkipForward } from 'lucide-react';
import { Macros, MealType, Recipe } from '@/lib/types';
import { useDailyPlanStore } from '@/stores/daily-tracker';
import { useRecipe } from '@/hooks/useRecipeById';
import { useRef } from 'react';

interface RecipeSelectorProps {
    typeName: string;
    children: ReactNode;
    currentMealType: MealType;
    isEditing?: boolean;
}

export default function RecipeSelector({
    typeName,
    children,
    currentMealType,
    isEditing = false,
}: RecipeSelectorProps) {
    const dailyPlan = useDailyPlanStore((state) => state.dailyPlan);
    const addMeal = useDailyPlanStore((state) => state.addMeal);
    const editMeal = useDailyPlanStore((state) => state.editMeal);
    const skipMeal = useDailyPlanStore((state) => state.skipMeal);
    const [recipeId, setRecipeId] = useState<string | undefined>(undefined);
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

        const meal = {
            type: currentMealType,
            recipe: currentRecipe,
        };

        if (isEditing) {
            editMeal(meal);
        } else {
            addMeal(meal);
        }

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

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current && recipeId) {
            // Zurück zum Anfang scrollen
            scrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [recipeId]);

    return (
        <Drawer onClose={() => resetRecipeSelection()}>
            <DrawerTrigger className='w-full h-full cursor-pointer'>
                {children}
            </DrawerTrigger>
            <DrawerContent className='md:px-18 xl:px-72 2xl:px-96 flex flex-col max-h-[90vh]'>
                <DrawerHeader className='pb-0 flex-shrink-0'>
                    <DrawerTitle className='text-xl'>
                        <RecipeDrawerTitle
                            typeName={typeName}
                            recipeName={recipe?.name}
                        />
                    </DrawerTitle>
                    <div className="sm:flex sm:space-between"><button
                        onClick={() => setRecipeId(undefined)}
                        className='cursor-pointer flex items-center gap-2 text-sm font-medium pl-0 mr-auto mb-2 underline-offset-4 hover:underline'>
                        <ArrowLeft size={16} /> Zurück zur{' '}
                        {recipeId ? 'Rezeptauswahl' : 'Tagesübersicht'}
                    </button>
                    <Button variant='outline' size='sm' onClick={() => skipMeal(currentMealType)}><SkipForward />Mahlzeit überspringen</Button></div>
                    <DrawerDescription>
                        {!recipeId
                            ? 'Wähle ein Rezept aus:'
                            : 'Zutaten & enthaltene Makronährstoffe:'}
                    </DrawerDescription>
                </DrawerHeader>

                <div
                    ref={scrollRef}
                    className='flex-grow min-h-0 overflow-y-auto'>
                    <AnimatePresence mode='wait'>
                        {!recipeId ? (
                            <motion.div
                                key='recipe-list'
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className='px-2'>
                                <RecipeList onSelect={handleRecipeSelection} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key='ingredient-list'
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className='px-2'>
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
                </div>

                {recipeId && (
                    <DrawerFooter className='flex flex-row justify-between flex-shrink-0'>
                        <DrawerClose asChild>
                            <Button variant='outline' className='mr-2'>
                                <Ban /> Abbrechen
                            </Button>
                        </DrawerClose>
                        <DrawerClose asChild>
                            <Button
                                variant='default'
                                className='ml-2'
                                onClick={handleAddMeal}>
                                <Plus /> Hinzufügen
                            </Button>
                        </DrawerClose>
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
            <span>
                {typeName} hinzufügen
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
            </span>
        </div>
    );
}
