/**
 * Pure helpers for turning a flat list of visits into what the homepage
 * needs: each restaurant's total spent and visit history, plus a display
 * order with recently-visited restaurants first.
 *
 * No React, no fetching - just data in, data out, so this is easy to reason
 * about (and test) on its own.
 */
import type { Restaurant, Visit } from './types';

export interface RestaurantStats {
  visits: Visit[];
  total: number;
  mostRecentDate: string | null;
}

/** Group visits by restaurantId, computing each restaurant's total and most recent visit date. */
export function statsByRestaurant(visits: Visit[]): Map<number, RestaurantStats> {
  const stats = new Map<number, RestaurantStats>();

  for (const visit of visits) {
    const existing = stats.get(visit.restaurantId) ?? {
      visits: [],
      total: 0,
      mostRecentDate: null,
    };

    existing.visits.push(visit);
    existing.total += visit.amountSpent ?? 0;
    if (existing.mostRecentDate === null || visit.date > existing.mostRecentDate) {
      existing.mostRecentDate = visit.date;
    }

    stats.set(visit.restaurantId, existing);
  }

  return stats;
}

/** Total amount spent across every visit, regardless of restaurant. */
export function grandTotal(visits: Visit[]): number {
  return visits.reduce((sum, visit) => sum + (visit.amountSpent ?? 0), 0);
}

/**
 * Order restaurants with a visit history first (most recently visited
 * first), then restaurants with no visits at all, unchanged, at the end -
 * there's no visit data to rank them by.
 */
export function sortByRecency(
  restaurants: Restaurant[],
  stats: Map<number, RestaurantStats>
): Restaurant[] {
  const visited = restaurants.filter((r) => stats.has(r.id));
  const unvisited = restaurants.filter((r) => !stats.has(r.id));

  visited.sort((a, b) => {
    const dateA = stats.get(a.id)!.mostRecentDate!;
    const dateB = stats.get(b.id)!.mostRecentDate!;
    return dateB.localeCompare(dateA);
  });

  return [...visited, ...unvisited];
}
