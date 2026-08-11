'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export const SignOut = () => {
    const router = useRouter();
    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => router.replace('/sign-in'),
            },
        });
    };

    return (
        <button
            onClick={handleSignOut}
            className="app-button bg-[#fca5a5] px-3 py-2 text-xs"
        >
            Sign Out
        </button>
    );
}
