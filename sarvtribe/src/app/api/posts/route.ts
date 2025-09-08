import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';
import { socket } from '@/lib/prismadb';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
  const { postBody, imageUrl, textOverlay, filter, textPosition, musicUrl } = body;

    if (!postBody && !imageUrl) {
      return new NextResponse('Post cannot be empty', { status: 400 });
    }
    
    const hashtagRegex = /#(\w+)/g;
    const hashtags = postBody.match(hashtagRegex)?.map(tag => tag.substring(1).toLowerCase()) || [];

    const post = await prisma.post.create({
    data: {
      body: postBody,
      imageUrl: imageUrl,
      hashtags: hashtags,
      textOverlay,
      filter,
      textPosition,
      musicUrl: musicUrl,
      userId: session.user.id,
      },
      include: {
        user: true,
      },
    });

    socket.emit("new_post", post);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('POST_CREATION_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        likes: true,
        comments: {
          // THIS IS THE FIX: Include the user (author) for each comment
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 2 // Only take the 2 most recent for the feed preview
        },
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('FETCH_POSTS_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}