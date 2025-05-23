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
      'protein': 'protein',
      'carbs': 'kohlenhydrate',
      'fat': 'fette',
    };
    
    return translations[macro];
}