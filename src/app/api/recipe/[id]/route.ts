import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest } from 'next';
import { recipes } from '@/lib/recipes';

export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    const { id } = context.params;
    const recipe = Object.values(recipes).find((r) => r.id === id);
    if (!recipe) {
        return NextResponse.json(
            { error: 'Recipe not found' },
            { status: 404 },
        );
    }
    return NextResponse.json(recipe);
}
