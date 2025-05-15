import { NextRequest, NextResponse } from 'next/server';
import { recipes } from '@/lib/recipes';

export async function GET(req: NextRequest) {
    return NextResponse.json(recipes);
}
