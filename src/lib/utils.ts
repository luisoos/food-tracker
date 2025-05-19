import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toGermanNumber(num: number, precision: number = 2) {
    return Number.parseFloat(num.toFixed(precision))
        .toString()
        .replace('.', ',');
}
