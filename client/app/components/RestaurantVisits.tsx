'use client';

import { useState } from 'react';
import type { Visit } from '@/lib/types';

interface Props {
  restaurantName: string;
  total: number;
  visits: Visit[];
}

/**
 * Trigger + modal showing one restaurant's visit history and total spent.
 * The only client-side piece of the homepage - everything else stays a
 * server component.
 */
export function RestaurantVisits({ restaurantName, total, visits }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        View visits ({visits.length}) · ${total.toFixed(2)} spent
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-medium">{restaurantName}</h3>
                <p className="text-sm text-gray-500">
                  ${total.toFixed(2)} spent total
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {visits.length === 0 ? (
              <p className="text-sm text-gray-500">No visits logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {visits.map((visit) => (
                  <li
                    key={visit.id}
                    className="rounded-md border border-gray-200 p-3 text-sm"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium">{visit.date}</span>
                      {visit.amountSpent !== null && (
                        <span className="text-gray-600">
                          ${visit.amountSpent.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {visit.notes && (
                      <p className="mt-1 text-gray-600">{visit.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
