import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, useAnimation } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface IngredientAdjustBannerProps {
    shake: boolean;
    isLoading?: boolean;
    onYes: () => void;
    onNo: () => void;
}

export default function IngredientAdjustBanner({
    shake,
    isLoading = false,
    onYes,
    onNo,
}: IngredientAdjustBannerProps) {
    const controls = useAnimation();

    useEffect(() => {
        // Fade-in on mount
        controls.start({ opacity: 1, y: 0, transition: { duration: 0.3 } });
    }, [controls]);

    useEffect(() => {
        if (shake) {
            controls.start({
                x: [0, -10, 10, -10, 10, 0],
                transition: {
                    duration: 0.6,
                    times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                },
            });
        }
    }, [shake, controls]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            className='flex flex-col items-center justify-center max-w-md mx-auto mt-4'>
            <p className='font-medium mb-4'>Mangel Ausgleich berechnen?</p>
            <div className='flex gap-4'>
                <OptionButton 
                    variant='disagree' 
                    onClick={onNo}
                    disabled={isLoading}>
                    <X />
                </OptionButton>
                <OptionButton 
                    variant='agree' 
                    onClick={onYes}
                    disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <Check />}
                </OptionButton>
            </div>
        </motion.div>
    );
}

function OptionButton({
    variant,
    onClick,
    children,
    disabled,
}: {
    variant: 'agree' | 'disagree';
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
}) {
    return (
        <Button
            className={cn(
                'flex items-center justify-center w-16 hover:shadow-md text-white transition-all duration-300 delay-50',
                variant === 'agree'
                    ? 'bg-green-700 hover:bg-green-600'
                    : 'bg-red-700 hover:bg-red-600',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={onClick}
            disabled={disabled}>
            {children}
        </Button>
    );
}
