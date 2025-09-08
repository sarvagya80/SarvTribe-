import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

// Helper function to get a temporary access token from Spotify
const getAccessToken = async () => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    throw new Error("Spotify credentials are not configured in .env.local");
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token. Check your credentials.");
  }

  const data = await response.json();
  return data.access_token;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');

    if (!query) {
      return new NextResponse('Query parameter "q" is required', { status: 400 });
    }

    // --- User Search ---
    if (type === 'user') {
      const users = await prisma.user.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: { id: true, name: true, image: true },
        take: 5,
      });
      return NextResponse.json(users);
    }

    // --- Image Search (Pixabay) ---
    else if (type === 'image') {
      const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
      if (!PIXABAY_API_KEY) throw new Error("Pixabay API key not configured.");
      
      const API_URL = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo`;
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch images from Pixabay');
      
      const data = await response.json();
      const formattedImages = data.hits.map((img: any) => ({
        id: img.id,
        previewURL: img.webformatURL,
        largeImageURL: img.largeImageURL,
      }));
      return NextResponse.json(formattedImages);
    } 
    
    // --- Music Search (Spotify) ---
    else if (type === 'music') {
      const accessToken = await getAccessToken();
      const API_URL = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`;

      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch music from Spotify');
      }

      const data = await response.json();
      
      const formattedTracks = data.tracks.items
        .filter((track: any) => track.preview_url) // Only include tracks that have a 30s preview
        .map((track: any) => ({
          id: track.id,
          title: track.name,
          artist: track.artists.map((artist: any) => artist.name).join(', '),
          audioUrl: track.preview_url,
          imageUrl: track.album.images[0]?.url,
        }));
        
      return NextResponse.json(formattedTracks);
    }
    
    return new NextResponse('Invalid search type', { status: 400 });

  } catch (error) {
    console.error("SEARCH_API_ERROR", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}