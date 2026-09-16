'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full p-8 text-center space-y-6 rounded-3xl border border-gray-200/80 shadow-lg bg-white">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 font-sans">
            Something went wrong
          </h1>
          <p className="text-sm text-gray-500">
            {error?.message || 'An unexpected error occurred while loading this page.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            size="lg"
            className="rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold px-6"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full text-xs font-bold px-6">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Return Home
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
