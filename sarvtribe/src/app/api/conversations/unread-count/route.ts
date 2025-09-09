// src/app/api/conversations/unread-count/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prismadb';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(0);
  }
  
  try {
    // Count conversations where the current user is a participant
    // AND there is at least one message they have not seen AND they are not the sender
    const unreadCount = await prisma.conversation.count({
      where: {
        participantIds: {
          has: session.user.id,
        },
        messages: {
          some: {
            NOT: {
              seenByIds: {
                has: session.user.id,
              },
            },
            senderId: {
              not: session.user.id
            }
          },
        },
      },
    });

    return NextResponse.json(unreadCount);
  } catch (error) {
    return NextResponse.json(0);
  }
}