import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';
import { socket } from '@/lib/prismadb';

// Function to CREATE a comment and notifications
export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { body, parentId } = await req.json();
    if (!body) {
      return new NextResponse('Comment body is required', { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        body,
        postId: params.postId,
        userId: session.user.id,
        parentId: parentId,
      },
      include: {
        user: true
      }
    });

    // --- Notification Logic ---
    try {
      if (parentId) {
        // This is a REPLY, notify the parent comment's author
        const parentComment = await prisma.comment.findUnique({ where: { id: parentId }});
        if (parentComment && parentComment.userId !== session.user.id) {
          await prisma.notification.create({
            data: {
              body: 'replied to your comment.',
              type: 'COMMENT',
              postId: params.postId,
              userId: parentComment.userId, // Recipient is the parent comment author
              senderId: session.user.id,
              senderName: session.user.name || 'A user',
              senderImage: session.user.image,
            },
          });
        }
      } else {
        // This is a TOP-LEVEL comment, notify the post's author
        const post = await prisma.post.findUnique({ where: { id: params.postId } });
        if (post && post.userId !== session.user.id) {
          await prisma.notification.create({
            data: {
              body: 'commented on your post.',
              type: 'COMMENT',
              postId: params.postId,
              userId: post.userId, // Recipient is the post author
              senderId: session.user.id,
              senderName: session.user.name || 'A user',
              senderImage: session.user.image,
            },
          });
        }
      }
    } catch (error) {
      console.error("NOTIFICATION_CREATION_ERROR_ON_COMMENT", error);
    }
    
    socket.emit("new_comment", comment);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("CREATE_COMMENT_ERROR", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Function to GET all comments for a post
export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: params.postId },
      include: { 
        user: true,
        likes: true,
        replies: {
          include: {
            user: true,
            likes: true,
          }
        } 
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error("FETCH_COMMENTS_ERROR", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}