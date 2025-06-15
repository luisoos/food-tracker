import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import { ucfirst } from '@/lib/utils';
import { BadgeInfo, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function IngredientAmountReason({ reason }: { reason: string }) {
    const [animate, setAnimate] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (reason) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 600);
            return () => clearTimeout(timer);
        }
    }, [reason]);

    return (
        <HoverCard open={isOpen} onOpenChange={setIsOpen}>
            <HoverCardTrigger
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }}>
                <motion.div
                    animate={
                        animate
                            ? {
                                  y: [0, -8, 0],
                                  scale: [1, 1.1, 1],
                              }
                            : {}
                    }
                    transition={{
                        duration: 0.6,
                        ease: 'easeInOut',
                        times: [0, 0.5, 1],
                    }}>
                    <BadgeInfo
                        size={16}
                        className='ml-1 mt-0.5 text-zinc-500'
                    />
                </motion.div>
            </HoverCardTrigger>
            <HoverCardContent align='start' className='flex'>
                <BrainCircuit size={16} className='mr-1 mt-0.5' />
                {ucfirst(reason)}
            </HoverCardContent>
        </HoverCard>
    );
}
