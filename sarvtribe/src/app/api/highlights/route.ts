// src/app/api/highlights/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prismadb';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, coverUrl, storyIds } = body;

    if (!title || !coverUrl || !storyIds || storyIds.length === 0) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const highlight = await prisma.storyHighlight.create({
      data: {
        title,
        coverUrl,
        storyIds,
        userId: session.user.id,
      },
    });

    return NextResponse.json(highlight, { status: 201 });
  } catch (error) {
    console.error('HIGHLIGHT_CREATION_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}