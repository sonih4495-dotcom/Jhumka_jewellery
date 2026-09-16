// Location: app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full p-8 text-center space-y-6 rounded-3xl border border-gray-200/80 shadow-lg bg-white">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <Sparkles className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 font-sans">
            Page Not Found
          </h1>
          <p className="text-sm text-gray-500">
            The jewellery piece or page you are looking for does not exist or has moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold px-6">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Return to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full text-xs font-bold px-6">
            <Link href="/products">
              Explore Drops <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}