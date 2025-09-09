// src/app/api/conversations/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prismadb';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: session.user.id,
        },
      },
      // Order by the most recently active conversation
      orderBy: {
        lastMessageAt: 'desc',
      },
      // Include the details of all participants
      include: {
        participants: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Only take the last message for the preview
        },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('FETCH_CONVERSATIONS_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
// This function finds or creates a new conversation with another user
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { targetUserId } = body;
    const currentUserId = session.user.id;

    if (!targetUserId) {
      return new NextResponse('Target user ID is required', { status: 400 });
    }

    // Look for an existing conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [currentUserId, targetUserId],
        },
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // If none exists, create a new one
    const newConversation = await prisma.conversation.create({
      data: {
        participantIds: [currentUserId, targetUserId],
        participants: {
          connect: [
            { id: currentUserId },
            { id: targetUserId },
          ],
        },
      },
    });

    return NextResponse.json(newConversation, { status: 201 });

  } catch (error) {
    console.error("CREATE_CONVERSATION_ERROR", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}