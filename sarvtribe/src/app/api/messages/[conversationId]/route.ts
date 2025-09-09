import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prismadb';
import { io } from 'socket.io-client';

const socket = io("http://localhost:3001");

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('FETCH_MESSAGES_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { body, image } = await req.json();

    if (!body && !image) {
      return new NextResponse('Message content is required', { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        body: body,
        image: image,
        conversationId: params.conversationId,
        senderId: session.user.id,
      },
      include: {
        sender: true,
      },
    });

    await prisma.conversation.update({
      where: { id: params.conversationId },
      data: { lastMessageAt: new Date() },
    });

    socket.emit("new_message", {
      message: newMessage,
      conversationId: params.conversationId,
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('SEND_MESSAGE_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}