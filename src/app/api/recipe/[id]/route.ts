import { NextRequest, NextResponse } from 'next/server';
import { recipes } from '@/lib/recipes';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const recipe = Object.values(recipes).find((r) => r.id === id);
    if (!recipe) {
        return NextResponse.json(
            { error: 'Recipe not found' },
            { status: 404 },
        );
    }
    return NextResponse.json(recipe);
}
