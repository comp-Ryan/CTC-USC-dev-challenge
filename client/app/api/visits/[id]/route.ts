import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';
import { toVisit } from '@/lib/types';
import { parseId, validateVisitInput } from '@/lib/validation';

type Params = { params: { id: string } };

/**
 * GET /api/visits/:id
 * Returns a single visit, or 404 if it doesn't exist.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    const { rows } = await pool.query('SELECT * FROM visits WHERE id = $1', [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    return NextResponse.json(toVisit(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PUT /api/visits/:id
 * Update an existing visit.
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    const body = await req.json();
    const input = validateVisitInput(body);

    const { rows } = await pool.query(
      'UPDATE visits SET "restaurantId" = $1, date = $2, "amountSpent" = $3, notes = $4 WHERE id = $5 RETURNING *',
      [input.restaurantId, input.date, input.amountSpent, input.notes, id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    return NextResponse.json(toVisit(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * DELETE /api/visits/:id
 * Delete a visit.
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    const { rows } = await pool.query('DELETE FROM visits WHERE id = $1 RETURNING id', [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
