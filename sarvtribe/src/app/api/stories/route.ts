// src/app/api/stories/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";

import prisma from '@/lib/prismadb';

// Function to CREATE a new story
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
     const { mediaUrl, mediaType, textOverlay, filter, textPosition, musicUrl } = body;
    if (!mediaUrl && !textOverlay) {
      return new NextResponse('Missing mediaUrl or mediaType', { status: 400 });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const story = await prisma.story.create({
      data: {
        mediaUrl,
        mediaType,
        textOverlay,
        filter,
        textPosition,
        musicUrl, // <-- Ensure this is being saved to the database
        expiresAt,
        userId: session.user.id,
      },
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error('STORY_CREATION_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Function to GET active stories from users you follow
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) return new NextResponse('User not found', { status: 404 });

    // Find stories from followed users + own stories that have not expired
    const userIdsToShow = [...currentUser.followingIds, currentUser.id];
    
    const stories = await prisma.story.findMany({
      where: {
        userId: { in: userIdsToShow },
        expiresAt: {
          gt: new Date(), // 'gt' means "greater than" the current time
        },
      },
      include: {
        user: true, // Include the author's details
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              }
            }
          }
        },
        views: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error('FETCH_STORIES_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}