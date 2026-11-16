import { useState } from 'react';
import { Check, Palette, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    COLOR_PRESETS,
    DEFAULT_PRIMARY_COLOR,
    usePrimaryColor,
} from '@/hooks/use-primary-color';
import { cn } from '@/lib/utils';

export interface ThemeColorPickerProps {
    variant?: 'card' | 'menu' | 'inline';
    className?: string;
}

export function ThemeColorPicker({ variant = 'card', className = '' }: ThemeColorPickerProps) {
    const { primaryColor, setPrimaryColor, resetPrimaryColor, presets } = usePrimaryColor();
    const [customColor, setCustomColor] = useState(primaryColor);

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        setCustomColor(val);
        setPrimaryColor(val);
    };

    const isDefault = primaryColor.toUpperCase() === DEFAULT_PRIMARY_COLOR.toUpperCase();

    // Swatches UI
    const swatches = (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
                {presets.map((preset) => {
                    const isSelected = primaryColor.toUpperCase() === preset.value.toUpperCase();
                    return (
                        <button
                            key={preset.value}
                            type="button"
                            onClick={() => {
                                setCustomColor(preset.value);
                                setPrimaryColor(preset.value);
                            }}
                            title={`${preset.name} (${preset.value})`}
                            style={{ backgroundColor: preset.value }}
                            className={cn(
                                'group relative size-8 rounded-full transition-transform hover:scale-110 active:scale-95 shadow-xs flex items-center justify-center',
                                isSelected
                                    ? 'ring-2 ring-offset-2 ring-[#444050] dark:ring-white scale-105'
                                    : 'opacity-90 hover:opacity-100',
                            )}
                        >
                            {isSelected && <Check className="size-4 text-white stroke-[3] drop-shadow-sm" />}
                        </button>
                    );
                })}
            </div>

            {/* Custom Color Row */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#dbdade]/60 dark:border-[#434968]">
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="custom-color-input"
                        className="relative flex size-8 cursor-pointer items-center justify-center rounded-lg border border-[#dbdade] bg-white shadow-xs transition hover:scale-105 dark:border-[#434968] dark:bg-[#2f3349]"
                        style={{ borderLeftColor: primaryColor, borderLeftWidth: 4 }}
                        title="Pick custom hex color"
                    >
                        <Palette className="size-4 text-neutral-500" />
                        <input
                            id="custom-color-input"
                            type="color"
                            value={customColor}
                            onChange={handleCustomChange}
                            className="absolute inset-0 cursor-pointer opacity-0"
                        />
                    </label>
                    <div className="text-xs">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-200 uppercase font-mono">
                            {primaryColor}
                        </span>
                    </div>
                </div>

                {!isDefault && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={resetPrimaryColor}
                        className="h-7 px-2 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1"
                        title="Reset to #FF7900"
                    >
                        <RotateCcw className="size-3" />
                        <span>Reset</span>
                    </Button>
                )}
            </div>
        </div>
    );

    // Variant: Dropdown menu for Header
    if (variant === 'menu') {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            'relative flex size-9 items-center justify-center rounded-lg transition text-[#5d596c] hover:bg-[#f4f5fb] dark:text-[#cfcde4] dark:hover:bg-[#353952]',
                            className,
                        )}
                        title="Change Brand Primary Color"
                    >
                        <Palette className="size-[18px] text-[var(--primary)]" />
                        <span
                            className="absolute bottom-1.5 right-1.5 size-2 rounded-full ring-1 ring-white dark:ring-[#2f3349]"
                            style={{ backgroundColor: primaryColor }}
                        />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-3 border-[#dbdade] dark:border-[#434968] bg-white dark:bg-[#2f3349] shadow-lg">
                    <DropdownMenuLabel className="p-0 pb-2 text-xs font-bold text-[#444050] dark:text-[#cfcde4] flex items-center justify-between">
                        <span>Theme Primary Color</span>
                        <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-mono font-bold"
                            style={{ borderColor: primaryColor, color: primaryColor }}
                        >
                            {primaryColor}
                        </Badge>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="mb-3" />
                    {swatches}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Variant: Inline (for Settings)
    if (variant === 'inline') {
        return <div className={cn('space-y-2', className)}>{swatches}</div>;
    }

    // Variant: Card (for Dashboard)
    return (
        <Card className={cn('border border-[#dbdade]/70 bg-white shadow-[0_2px_6px_0_rgba(47,43,61,0.08)] dark:border-[#434968] dark:bg-[#2f3349]', className)}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle className="text-base font-bold text-[#444050] dark:text-[#cfcde4] flex items-center gap-2">
                        <Palette className="size-4 text-[var(--primary)]" />
                        <span>Theme &amp; Brand Color</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-[#82808b] dark:text-[#a5a3ae] mt-1">
                        Change the live primary accent color across all buttons, highlights, and dashboard menus.
                    </CardDescription>
                </div>
                <Badge
                    className="font-mono font-bold text-xs uppercase text-white shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                >
                    {primaryColor}
                </Badge>
            </CardHeader>
            <CardContent className="pt-1">
                {swatches}
            </CardContent>
        </Card>
    );
}

export default ThemeColorPicker;
