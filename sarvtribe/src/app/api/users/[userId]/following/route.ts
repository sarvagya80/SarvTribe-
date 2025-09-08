// src/app/api/users/[userId]/following/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    if (!userId || userId.length !== 24) {
      return new NextResponse('Invalid User ID', { status: 400 });
    }

    // 1. Find the user whose following list we want
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // 2. Find all users whose IDs are in the target user's `followingIds` array
    const following = await prisma.user.findMany({
      where: {
        id: {
          in: user.followingIds,
        },
      },
      select: { // Only return public-safe data
        id: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json(following);
  } catch (error) {
    console.error('FETCH_FOLLOWING_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}