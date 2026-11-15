import { Head, Link, usePage } from '@inertiajs/react';
import { ExternalLink, Key, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { login, register } from '@/routes';

export default function Welcome() {
    const page = usePage();
    const { auth, currentTeam } = page.props as {
        auth?: { user?: { name?: string } };
        currentTeam?: { slug?: string };
    };

    const dashboardUrl = currentTeam?.slug ? `/${currentTeam.slug}/dashboard` : '/dashboard';

    return (
        <>
            <Head title="Classy Missy - Skincare & Beauty Admin Portal" />

            <div className="relative min-h-screen bg-neutral-50/50 flex flex-col justify-between dark:bg-neutral-950">
                {/* Header */}
                <header className="w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/80">
                    <div className="mx-auto flex max-w-6xl items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AppLogo />
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" asChild>
                                <a
                                    href="https://eclectic-kleicha-c2a33e.netlify.app/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300"
                                >
                                    <span>Storefront</span>
                                    <ExternalLink className="size-3.5" />
                                </a>
                            </Button>

                            {auth?.user ? (
                                <Button size="sm" asChild className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white">
                                    <Link href={dashboardUrl}>Enter Admin Dashboard</Link>
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    <Button size="sm" asChild className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white">
                                        <Link href={register()}>Register</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-1 flex items-center justify-center py-12 px-6">
                    <div className="w-full max-w-4xl space-y-10">
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#7367f0]/20 bg-[#7367f0]/10 px-3 py-1 text-xs font-semibold text-[#7367F0] dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                                <Sparkles className="size-3.5" /> Luxury Skincare & Beauty E-Commerce
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
                                Classy Missy Admin Portal
                            </h1>
                            <p className="mx-auto max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
                                Full-featured Laravel & React admin dashboard equipped with dynamic Role Management, catalog control, stock monitoring, orders dispatch, and customer relations.
                            </p>

                            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                                {auth?.user ? (
                                    <Button size="lg" asChild className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white px-8">
                                        <Link href={dashboardUrl}>Launch Admin Dashboard</Link>
                                    </Button>
                                ) : (
                                    <Button size="lg" asChild className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white px-8">
                                        <Link href={login()}>Sign In to Dashboard</Link>
                                    </Button>
                                )}

                                <Button size="lg" variant="outline" asChild>
                                    <a
                                        href="https://eclectic-kleicha-c2a33e.netlify.app/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <span>Preview Next.js Storefront</span>
                                        <ExternalLink className="size-4" />
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Demo Accounts Card */}
                        <Card className="border-neutral-200 shadow-md bg-white dark:border-neutral-800 dark:bg-neutral-900">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                                        <ShieldCheck className="size-4 text-[#7367F0]" />
                                        <span>Pre-seeded Demo Accounts & Role Hierarchy</span>
                                    </div>
                                    <span className="text-xs text-neutral-400">Default Password: <strong>password</strong></span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-lg border border-neutral-200 p-3 space-y-1.5 dark:border-neutral-800">
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-[#7367f0]/10 text-[#7367F0] border-[#7367f0]/20 text-[10px]">Super Admin</Badge>
                                            <Lock className="size-3 text-neutral-400" />
                                        </div>
                                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">admin@classymissy.com</div>
                                        <div className="text-[11px] text-neutral-500">Full system & role control</div>
                                    </div>

                                    <div className="rounded-lg border border-neutral-200 p-3 space-y-1.5 dark:border-neutral-800">
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Store Manager</Badge>
                                            <Lock className="size-3 text-neutral-400" />
                                        </div>
                                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">manager@classymissy.com</div>
                                        <div className="text-[11px] text-neutral-500">Catalogue & orders fulfillment</div>
                                    </div>

                                    <div className="rounded-lg border border-neutral-200 p-3 space-y-1.5 dark:border-neutral-800">
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Content Editor</Badge>
                                            <Lock className="size-3 text-neutral-400" />
                                        </div>
                                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">editor@classymissy.com</div>
                                        <div className="text-[11px] text-neutral-500">Campaigns & product copy</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>

                {/* Footer */}
                <footer className="w-full border-t border-neutral-200 py-6 text-center text-xs text-neutral-500 dark:border-neutral-800">
                    Classy Missy Beauty E-Commerce Admin System • Built with Laravel 13, Inertia.js & React 19
                </footer>
            </div>
        </>
    );
}
