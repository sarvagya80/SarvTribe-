// src/lib/prismadb.ts
import { PrismaClient } from '@prisma/client';
import { io } from 'socket.io-client';

declare global {
  var prismadb: PrismaClient | undefined;
  var socket: any | undefined;
}

// Prisma Client Singleton
export const client = globalThis.prismadb || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prismadb = client;

// Socket.IO Client Singleton
export const socket = globalThis.socket || io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");
if (process.env.NODE_ENV !== 'production') globalThis.socket = socket;

export default client;