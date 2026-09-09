import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';
import { toRestaurant } from '@/lib/types';
import { parseId, validateRestaurantInput } from '@/lib/validation';

type Params = { params: { id: string } };

/**
 * GET /api/restaurants/:id
 * Returns a single restaurant, or 404 if it doesn't exist.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const { rows } = await pool.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json(toRestaurant(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PUT /api/restaurants/:id
 * Update an existing restaurant.
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const body = await req.json();
    const input = validateRestaurantInput(body);

    const { rows } = await pool.query(
      'UPDATE restaurants SET name = $1, cuisine = $2, address = $3, rating = $4 WHERE id = $5 RETURNING *',
      [input.name, input.cuisine, input.address, input.rating, id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json(toRestaurant(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * DELETE /api/restaurants/:id
 * Delete a restaurant.
 *
 * Worth noticing: the migration already made a call about what happens to that
 * restaurant's visits. Go read it. If you disagree with it, say so in your
 * write-up.
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const id = parseId(params.id);
    if (id === null) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const { rows } = await pool.query(
      'DELETE FROM restaurants WHERE id = $1 RETURNING id',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
