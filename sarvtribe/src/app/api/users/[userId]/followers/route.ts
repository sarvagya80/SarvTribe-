// src/app/api/users/[userId]/followers/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
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

    // Find all users whose `followingIds` array contains the target user's ID
    const followers = await prisma.user.findMany({
      where: {
        followingIds: {
          has: userId,
        },
      },
      select: { // Only return public-safe data
        id: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json(followers);
  } catch (error) {
    console.error('FETCH_FOLLOWERS_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
// This function handles the "Remove Follower" action
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const followerIdToRemove = params.userId;
    const currentUserId = session.user.id;
    
    // Find the follower we want to remove
    const follower = await prisma.user.findUnique({
      where: { id: followerIdToRemove },
    });

    if (!follower) {
      return new NextResponse('Follower not found', { status: 404 });
    }

    // Remove the current user's ID from the follower's `followingIds` list
    const updatedFollowingIds = follower.followingIds.filter(id => id !== currentUserId);

    await prisma.user.update({
      where: { id: followerIdToRemove },
      data: {
        followingIds: updatedFollowingIds,
      },
    });

    return new NextResponse('Follower removed', { status: 200 });
  } catch (error) {
    console.error('REMOVE_FOLLOWER_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}