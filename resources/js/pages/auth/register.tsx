import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';

export default function Register() {
    return (
        <>
            <Head title="Registration Disabled" />
            <div className="text-center space-y-4 py-8">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                    Registration is Closed
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Direct public registration is disabled for this administrative portal. Staff accounts are created internally by administrators.
                </p>
                <div className="pt-2">
                    <Button asChild>
                        <a href={login()}>Go to Login</a>
                    </Button>
                </div>
            </div>
        </>
    );
}
