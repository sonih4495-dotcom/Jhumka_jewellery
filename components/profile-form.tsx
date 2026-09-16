'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ProfileFormProps {
  initialData?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      image: initialData?.image || '',
      phone: initialData?.phone || '',
    },
    values: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      image: initialData?.image || '',
      phone: initialData?.phone || '',
    },
  });

  const currentImage = watch('image');

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          image: data.image,
          phone: data.phone,
        }),
      });

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Profile updated successfully!' });
      } else {
        const resData = await response.json().catch(() => ({}));
        setFeedback({ type: 'error', message: resData.error || 'Failed to update profile.' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setFeedback({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      {feedback && (
        <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'} className={feedback.type === 'success' ? 'border-emerald-500/50 bg-emerald-50 text-emerald-900' : ''}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 mr-2" />
          )}
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {currentImage && (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="relative h-14 w-14 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
            <Image
              src={currentImage}
              alt="Profile avatar"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">Avatar Preview</p>
            <p className="text-[11px] text-gray-500">Connected with your account</p>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-700">Full Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Your full name"
          className="rounded-xl border-gray-300 focus-visible:ring-rose-500"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-700">Email Address</Label>
        <Input
          id="email"
          {...register('email')}
          type="email"
          disabled
          className="rounded-xl border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
        />
        <p className="text-[11px] text-gray-400">Email address is linked to your authentication login.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gray-700">Phone Number</Label>
        <Input
          id="phone"
          {...register('phone')}
          type="tel"
          placeholder="e.g. 9876543210"
          className="rounded-xl border-gray-300 focus-visible:ring-rose-500"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="image" className="text-xs font-bold uppercase tracking-wider text-gray-700">Profile Image URL</Label>
        <Input
          id="image"
          {...register('image')}
          placeholder="https://images.unsplash.com/..."
          className="rounded-xl border-gray-300 focus-visible:ring-rose-500"
        />
      </div>

      <Button
        type="submit"
        disabled={isSaving}
        className="rounded-full bg-gray-900 text-white hover:bg-black px-6 py-2 font-semibold shadow-sm"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Update Profile'
        )}
      </Button>
    </form>
  );
}

