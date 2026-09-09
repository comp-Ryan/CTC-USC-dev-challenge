import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';
import { toVisit } from '@/lib/types';
import { validateVisitInput } from '@/lib/validation';

/**
 * GET /api/visits
 * Returns all visits.
 */
export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM visits ORDER BY date DESC');
    return NextResponse.json(rows.map(toVisit));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/visits
 * Create a new visit.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateVisitInput(body);

    const { rows } = await pool.query(
      'INSERT INTO visits ("restaurantId", date, "amountSpent", notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [input.restaurantId, input.date, input.amountSpent, input.notes]
    );

    return NextResponse.json(toVisit(rows[0]), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
