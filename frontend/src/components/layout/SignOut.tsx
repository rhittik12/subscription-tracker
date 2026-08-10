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
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
            Sign Out
        </button>
    );
}