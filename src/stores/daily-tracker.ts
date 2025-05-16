import { DailyPlan } from '@/lib/types';
import { create } from 'zustand';

type Store = {
    dailyPlan: DailyPlan | null;
    setDailyPlan: (dailyPlan: DailyPlan) => void;
    loadDailyPlan: () => void;
};

export const useDailyPlanStore = create<Store>((set) => ({
    dailyPlan: null,
    setDailyPlan: (dailyPlan) => {
        localStorage.setItem('dailyPlan', JSON.stringify(dailyPlan));
        set({ dailyPlan });
    },
    loadDailyPlan: () => {
        const storedDailyPlan = localStorage.getItem('dailyPlan');
        if (storedDailyPlan) {
            set({ dailyPlan: JSON.parse(storedDailyPlan) });
        }
    },
}));
