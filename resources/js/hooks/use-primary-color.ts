import { useSyncExternalStore } from 'react';

export const DEFAULT_PRIMARY_COLOR = '#FF7900';

export interface ColorPreset {
    name: string;
    value: string;
    description?: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
    { name: 'Orange', value: '#FF7900', description: 'Vibrant Classy Missy Orange (Default)' },
    { name: 'Purple', value: '#7367F0', description: 'Classic Vuexy Purple' },
    { name: 'Emerald', value: '#28C76F', description: 'Fresh Skincare Mint' },
    { name: 'Cyan', value: '#00BAD1', description: 'Clean Clinical Cyan' },
    { name: 'Rose', value: '#FF4C51', description: 'Bold Passion Rose' },
    { name: 'Amber', value: '#FF9F43', description: 'Warm Golden Glow' },
    { name: 'Indigo', value: '#4F46E5', description: 'Royal Deep Indigo' },
    { name: 'Pink', value: '#EC4899', description: 'Playful Velvet Pink' },
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
        cleanHex = cleanHex
            .split('')
            .map((char) => char + char)
            .join('');
    }
    const num = parseInt(cleanHex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

function adjustBrightness(hex: string, percent: number): string {
    const { r, g, b } = hexToRgb(hex);
    const adjust = (val: number) => {
        const adjusted = Math.round(val + (percent / 100) * 255);
        return Math.max(0, Math.min(255, adjusted));
    };
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

export function applyPrimaryColor(colorHex: string): void {
    if (typeof document === 'undefined') return;

    const validHex = /^#([0-9a-fA-F]{3}){1,2}$/.test(colorHex)
        ? colorHex
        : DEFAULT_PRIMARY_COLOR;

    const { r, g, b } = hexToRgb(validHex);
    // Darker shade for hover states (-14%)
    const hoverColor = adjustBrightness(validHex, -14);
    // Lighter tint for gradients/glows (+20%)
    const lightTint = adjustBrightness(validHex, 20);

    const root = document.documentElement;
    root.style.setProperty('--primary', validHex);
    root.style.setProperty('--color-primary', validHex);
    root.style.setProperty('--color-vuexy-primary', validHex);
    root.style.setProperty('--primary-hover', hoverColor);
    root.style.setProperty('--primary-light', lightTint);
    root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    root.style.setProperty('--ring', `rgba(${r}, ${g}, ${b}, 0.4)`);
    root.style.setProperty('--sidebar-ring', `rgba(${r}, ${g}, ${b}, 0.4)`);

    // Store in cookie for SSR and persistence
    const maxAge = 365 * 24 * 60 * 60;
    document.cookie = `app_primary_color=${encodeURIComponent(validHex)};path=/;max-age=${maxAge};SameSite=Lax`;
}

const listeners = new Set<() => void>();
let currentColor: string = DEFAULT_PRIMARY_COLOR;

export function getStoredPrimaryColor(): string {
    if (typeof window === 'undefined') return DEFAULT_PRIMARY_COLOR;
    const stored = localStorage.getItem('app_primary_color');
    if (stored && /^#([0-9a-fA-F]{3}){1,2}$/.test(stored)) {
        return stored;
    }
    return DEFAULT_PRIMARY_COLOR;
}

export function initializePrimaryColor(): void {
    if (typeof window === 'undefined') return;

    currentColor = getStoredPrimaryColor();
    applyPrimaryColor(currentColor);
}

export function setPrimaryColor(colorHex: string): void {
    if (!/^#([0-9a-fA-F]{3}){1,2}$/.test(colorHex)) return;

    currentColor = colorHex;
    if (typeof window !== 'undefined') {
        localStorage.setItem('app_primary_color', colorHex);
    }
    applyPrimaryColor(colorHex);
    listeners.forEach((listener) => listener());
}

export function usePrimaryColor() {
    const color = useSyncExternalStore(
        (callback) => {
            listeners.add(callback);
            return () => listeners.delete(callback);
        },
        () => currentColor,
        () => DEFAULT_PRIMARY_COLOR,
    );

    return {
        primaryColor: color,
        setPrimaryColor,
        resetPrimaryColor: () => setPrimaryColor(DEFAULT_PRIMARY_COLOR),
        presets: COLOR_PRESETS,
    };
}
