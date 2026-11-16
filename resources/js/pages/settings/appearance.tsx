import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { ThemeColorPicker } from '@/components/theme-color-picker';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <div>
                    <Heading
                        variant="small"
                        title="Theme Mode"
                        description="Select light, dark, or system preference"
                    />
                    <div className="mt-3">
                        <AppearanceTabs />
                    </div>
                </div>

                <div className="pt-4 border-t border-[#dbdade]/60 dark:border-[#434968]">
                    <Heading
                        variant="small"
                        title="Primary Brand Accent Color"
                        description="Choose a preset swatch or pick a custom hexadecimal color (#FF7900 default)"
                    />
                    <div className="mt-4 max-w-md">
                        <ThemeColorPicker variant="inline" />
                    </div>
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
