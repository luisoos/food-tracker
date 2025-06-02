import { Button } from '@/components/ui/button';
import { Loader, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DailyBalanceButtonProps {
    onClick: () => void;
    isLoading?: boolean;
    className?: string;
}

export default function DailyBalanceButton({
    onClick,
    isLoading = false,
    className,
}: DailyBalanceButtonProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}>
            <Button
                variant='outline'
                size='sm'
                onClick={onClick}
                disabled={isLoading}
                className={cn(
                    'w-44 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
                    'border-zinc-200 hover:border-zinc-300',
                    'transition-all duration-300',
                    className,
                )}>
                {isLoading ? (
                    <>
                        <Loader size={14} className='mr-1.5 animate-spin' />{' '}
                        <span>Anpassen...</span>
                    </>
                ) : (
                    <>
                        <Scale size={14} className='mr-1.5' />
                        <span>Tagesbilanz ausgleichen</span>
                    </>
                )}
            </Button>
        </motion.div>
    );
}
