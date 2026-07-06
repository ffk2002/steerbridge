'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Unhandled application error:', error);
    }, [error]);

    return (
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
                <p className="text-muted-foreground max-w-[500px]">
                    An unexpected error occurred. Our team has been notified.
                </p>
            </div>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
