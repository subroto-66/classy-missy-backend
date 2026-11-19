import { useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function AppLogo({ className = '' }: { className?: string }) {
    const page = usePage();
    const branding = page.props.appBranding as {
        logo?: string;
        logo_dark?: string;
        title?: string;
        subtitle?: string;
    } | undefined;
    const currentLogo = branding?.logo || '/logo.svg';
    const darkLogo = branding?.logo_dark;
    const title = branding?.title || 'Classy Missy';
    const subtitle = branding?.subtitle || 'Admin Panel';

    const [imageError, setImageError] = useState(false);

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            {!imageError ? (
                <div className="flex h-10 items-center">
                    {darkLogo ? (
                        <>
                            <img
                                key={`light-${currentLogo}`}
                                src={currentLogo}
                                alt={title}
                                className="h-8 max-h-8 w-auto max-w-[150px] object-contain transition-all group-data-[collapsible=icon]:hidden dark:hidden"
                                onError={() => setImageError(true)}
                            />
                            <img
                                key={`dark-${darkLogo}`}
                                src={darkLogo}
                                alt={title}
                                className="h-8 max-h-8 w-auto max-w-[150px] object-contain transition-all group-data-[collapsible=icon]:hidden hidden dark:block"
                                onError={() => setImageError(true)}
                            />
                        </>
                    ) : (
                        <img
                            key={currentLogo}
                            src={currentLogo}
                            alt={title}
                            className="h-8 max-h-8 w-auto max-w-[150px] object-contain dark:brightness-0 dark:invert transition-all group-data-[collapsible=icon]:hidden"
                            onError={() => setImageError(true)}
                        />
                    )}
                    {/* Collapsed Sidebar Icon Mark */}
                    <div className="hidden group-data-[collapsible=icon]:flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 48 48"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M43.61 5.15H36.1a1.17 1.17 0 0 0-1 .42c-.6.71-1.18 1.44-1.8 2.14-4.18 5-8.39 10-12.58 15-1.08 1.24-2.07 2.57-3.21 3.75a9 9 0 0 1 0-.89V6.23a1.09 1.09 0 0 0-1.16-1.08H5A1.18 1.18 0 0 0 3.92 6v40l.08-.09c1.15-1.38 2.31-2.75 3.46-4.12.44-.54 1-1.07 1-1.82V10.94a1.17 1.17 0 0 1 .42-1A1.8 1.8 0 0 1 10 9.71h2.06a1.12 1.12 0 0 1 .9 1.2v28.05c.5-.52.94-1.09 1.41-1.64l5.67-6.76a1.11 1.11 0 0 1 1.42-.35 6 6 0 0 1 1 1.06c4 4.73 7.94 9.45 11.89 14.18a1.17 1.17 0 0 0 1 .5h5.37c-.48-.7-1.08-1.31-1.6-2-2.05-2.4-4.12-4.85-6.12-7.31-2.68-3.17-5.32-6.36-8-9.53-.27-.33-.64-.67-.63-1.14a1.4 1.4 0 0 1 .41-.91c2.61-3.07 5.18-6.18 7.79-9.25 1.52-1.83 3-3.65 4.58-5.48a1.27 1.27 0 0 1 .91-.6 5.4 5.4 0 0 1 1.45 0 1.14 1.14 0 0 1 .67 1.27v29c0 .75.57 1.28 1 1.82 1.15 1.37 2.31 2.74 3.45 4.12l.07.09V6.41a1.12 1.12 0 0 0-1.09-1.26Z" />
                        </svg>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 48 48"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M43.61 5.15H36.1a1.17 1.17 0 0 0-1 .42c-.6.71-1.18 1.44-1.8 2.14-4.18 5-8.39 10-12.58 15-1.08 1.24-2.07 2.57-3.21 3.75a9 9 0 0 1 0-.89V6.23a1.09 1.09 0 0 0-1.16-1.08H5A1.18 1.18 0 0 0 3.92 6v40l.08-.09c1.15-1.38 2.31-2.75 3.46-4.12.44-.54 1-1.07 1-1.82V10.94a1.17 1.17 0 0 1 .42-1A1.8 1.8 0 0 1 10 9.71h2.06a1.12 1.12 0 0 1 .9 1.2v28.05c.5-.52.94-1.09 1.41-1.64l5.67-6.76a1.11 1.11 0 0 1 1.42-.35 6 6 0 0 1 1 1.06c4 4.73 7.94 9.45 11.89 14.18a1.17 1.17 0 0 0 1 .5h5.37c-.48-.7-1.08-1.31-1.6-2-2.05-2.4-4.12-4.85-6.12-7.31-2.68-3.17-5.32-6.36-8-9.53-.27-.33-.64-.67-.63-1.14a1.4 1.4 0 0 1 .41-.91c2.61-3.07 5.18-6.18 7.79-9.25 1.52-1.83 3-3.65 4.58-5.48a1.27 1.27 0 0 1 .91-.6 5.4 5.4 0 0 1 1.45 0 1.14 1.14 0 0 1 .67 1.27v29c0 .75.57 1.28 1 1.82 1.15 1.37 2.31 2.74 3.45 4.12l.07.09V6.41a1.12 1.12 0 0 0-1.09-1.26Z" />
                        </svg>
                    </div>
                    <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                        <span className="text-[1.2rem] font-bold tracking-tight text-[#444050] dark:text-[#cfcde4] leading-tight font-sans">
                            {title}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                            {subtitle}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
