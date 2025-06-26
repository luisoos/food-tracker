import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Macros } from './types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toGermanNumber(num: number, precision: number = 2) {
    return Number.parseFloat(num.toFixed(precision))
        .toString()
        .replace('.', ',');
}

export function ucfirst(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function translateMacroToGerman(macro: keyof Macros): string {
    const translations: Record<keyof Macros, string> = {
        protein: 'protein',
        carbs: 'kohlenhydrate',
        fat: 'fette',
    };

    return translations[macro];
}

export function gramOrEgg(gram: string, isEgg: boolean): number {
    return Math.round(Number(gram) / (isEgg ? 60 : 1));
}

export function eggToGram(gram: string, isEgg: boolean): number {
    return Math.round(Number(gram) * (isEgg ? 60 : 1));
}

/**
 * Rounds the ingredient amount to the nearest 10g (kaufmännisch), but only if value >= 50.
 * If value < 50, returns the value unchanged.
 */
export function roundIngredientAmount(value: number): number {
    if (value < 50) return value;
    return Math.round(value / 10) * 10;
}
