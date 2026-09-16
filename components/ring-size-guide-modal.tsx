// Location: components/ring-size-guide-modal.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RING_SIZES } from '@/lib/utils';
import { Ruler, Sparkles, Info } from 'lucide-react';

export function RingSizeGuideModal({ trigger }: { trigger?: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<'chart' | 'measure'>('chart');

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button type="button" className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline">
            <Ruler className="h-3.5 w-3.5" />
            Indian Ring Size Guide
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Jhumka Junction Ring Sizing Chart
          </DialogTitle>
          <p className="text-xs text-gray-500">
            Find your perfect fit for statement &amp; oxidised rings.
          </p>
        </DialogHeader>

        <div className="flex rounded-xl bg-purple-50/70 p-1 mt-3">
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'chart'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Indian Size Chart
          </button>
          <button
            onClick={() => setActiveTab('measure')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'measure'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            How to Measure at Home
          </button>
        </div>

        {activeTab === 'chart' ? (
          <div className="mt-4 space-y-4">
            <div className="overflow-hidden rounded-xl border border-pink-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-purple-50/70 text-purple-900">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Indian Ring Size</th>
                    <th className="px-4 py-3 font-semibold">Inside Diameter (mm)</th>
                    <th className="px-4 py-3 font-semibold">Finger Circumference (mm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {RING_SIZES.map((row, index) => (
                    <tr
                      key={row.size}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-pink-50/20'}
                    >
                      <td className="px-4 py-2.5 font-bold text-gray-900">
                        Size {row.size}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{row.diameterMm} mm</td>
                      <td className="px-4 py-2.5 text-gray-600">{row.circumferenceMm} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Pro-tip:</strong> Most of our Jhumka Junction rings are crafted as <strong>Free Size / Adjustable</strong>, allowing you to gently pinch or widen them for any finger!
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-xs text-gray-600">
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-100 p-3.5 bg-white">
                <p className="font-bold text-gray-900 mb-1">Step 1: The String or Paper Strip Method</p>
                <p>Wrap a non-stretchy string or narrow slip of paper comfortably around the base of the finger you want to wear the ring on.</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3.5 bg-white">
                <p className="font-bold text-gray-900 mb-1">Step 2: Mark the Overlap</p>
                <p>Use a fine pen to mark the exact point where the ends overlap without squeezing your skin tightly.</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3.5 bg-white">
                <p className="font-bold text-gray-900 mb-1">Step 3: Measure in Millimeters (mm)</p>
                <p>Lay the string flat against a standard ruler and measure the length in mm to get your circumference, then match it to the table!</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
