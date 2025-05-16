import { NextRequest, NextResponse } from 'next/server';
import { recipes } from '@/lib/recipes';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    const recipe = Object.values(recipes).find((r) => r.id === params.id);
    if (!recipe) {
        return NextResponse.json(
            { error: 'Recipe not found' },
            { status: 404 },
        );
    }
    return NextResponse.json(recipe);
}
