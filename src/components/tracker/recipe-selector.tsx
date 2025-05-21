import { ReactNode, useState } from 'react';
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

export default function RecipeSelector({
    typeName,
    children,
}: {
    typeName: string;
    children: ReactNode;
}) {
    const [recipeId, setRecipeId] = useState<string | undefined>(undefined);

    const handleRecipeSelection = (recipeId: string) => {
        setRecipeId(recipeId);
        // "back"-button: resets selected recipe (setRecipeId())
    };

    const resetRecipeSelection = (recipeId: string) => {
        setRecipeId(undefined);
    };

    return (
        <Drawer>
            <DrawerTrigger className='w-full h-full cursor-pointer'>
                {children}
            </DrawerTrigger>
            <DrawerContent className='px-4 md:px-32 xl:px-72 2xl:px-96'>
                <DrawerHeader>
                    <DrawerTitle className='text-xl'>
                        {typeName} hinzufügen
                    </DrawerTitle>
                    <AnimatePresence mode='wait'>
                        {!recipeId ? (
                            <motion.div
                                key='recipe-list'
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}>
                                <DrawerDescription>
                                    Wähle ein Rezept aus:
                                </DrawerDescription>
                                <RecipeList onSelect={handleRecipeSelection} />
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
                                <IngredientList recipeId={recipeId!} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DrawerHeader>
                <DrawerFooter className='flex flex-row justify-between'>
                    <DrawerClose asChild>
                        <Button variant='outline' className='mr-2'>
                            <Ban /> Abbrechen
                        </Button>
                    </DrawerClose>
                    {recipeId && (
                        <Button variant='default' className='ml-2'>
                            <Plus /> Hinzufügen
                        </Button>
                    )}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
