import { ValidationError } from './errors';

export interface RestaurantInput {
  name: string;
  cuisine: string | null;
  address: string | null;
  rating: number | null;
}

/**
 * Validate and normalize a restaurant create/update body. Throws
 * ValidationError (caught by handleError, mapped to 400) on bad input.
 */
export function validateRestaurantInput(body: unknown): RestaurantInput {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Request body must be a JSON object');
  }

  const { name, cuisine, address, rating } = body as Record<string, unknown>;

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new ValidationError('name is required and must be a non-empty string');
  }

  if (cuisine !== undefined && cuisine !== null && typeof cuisine !== 'string') {
    throw new ValidationError('cuisine must be a string');
  }

  if (address !== undefined && address !== null && typeof address !== 'string') {
    throw new ValidationError('address must be a string');
  }

  if (rating !== undefined && rating !== null) {
    if (typeof rating !== 'number' || Number.isNaN(rating)) {
      throw new ValidationError('rating must be a number');
    }
    if (rating < 0 || rating > 5) {
      throw new ValidationError('rating must be between 0 and 5');
    }
  }

  return {
    name: name.trim(),
    cuisine: (cuisine as string | null) ?? null,
    address: (address as string | null) ?? null,
    rating: (rating as number | null) ?? null,
  };
}

/**
 * Parse a route :id param as a positive integer. Returns null if it isn't
 * one - the contract treats a malformed id as "no such restaurant" (404),
 * not a validation error (400).
 */
export function parseId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return id > 0 ? id : null;
}

export interface VisitInput {
  restaurantId: number;
  date: string;
  amountSpent: number | null;
  notes: string | null;
}

/**
 * Validate and normalize a visit create/update body. Throws ValidationError
 * (caught by handleError, mapped to 400) on bad input.
 */
export function validateVisitInput(body: unknown): VisitInput {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Request body must be a JSON object');
  }

  const { restaurantId, date, amountSpent, notes } = body as Record<string, unknown>;

  if (typeof restaurantId !== 'number' || !Number.isInteger(restaurantId) || restaurantId <= 0) {
    throw new ValidationError('restaurantId is required and must be a positive integer');
  }

  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    throw new ValidationError('date is required and must be a valid YYYY-MM-DD date');
  }

  if (amountSpent !== undefined && amountSpent !== null) {
    if (typeof amountSpent !== 'number' || Number.isNaN(amountSpent)) {
      throw new ValidationError('amountSpent must be a number');
    }
    if (amountSpent < 0) {
      throw new ValidationError('amountSpent must be zero or greater');
    }
  }

  if (notes !== undefined && notes !== null && typeof notes !== 'string') {
    throw new ValidationError('notes must be a string');
  }

  return {
    restaurantId,
    date,
    amountSpent: (amountSpent as number | null) ?? null,
    notes: (notes as string | null) ?? null,
  };
}
