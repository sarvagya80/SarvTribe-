import { AuthOptions } from 'next-auth';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prismadb';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" }, // Add OTP to credentials
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.otp) {
          throw new Error('Missing credentials');
        }

        const email = credentials.email.trim();
        const password = credentials.password.trim();
        const otp = credentials.otp.trim();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword || !user.otp || !user.otpExpires) {
          throw new Error('Invalid credentials');
        }

        // 1. Check if password is correct
        const isCorrectPassword = await bcrypt.compare(password, user.hashedPassword);
        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        // 2. Check if OTP has expired
        if (user.otpExpires < new Date()) {
          throw new Error('OTP has expired');
        }

        // 3. Check if OTP is correct
        const isCorrectOtp = await bcrypt.compare(otp, user.otp);
        if (!isCorrectOtp) {
          throw new Error('Invalid OTP');
        }
        
        // Clear the OTP after successful verification
        await prisma.user.update({
          where: { id: user.id },
          data: { otp: null, otpExpires: null },
        });

        return user; // Success
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign in, persist id and image on the token
      if (user) {
        token.id = user.id as unknown as string;
        (token as any).picture = (user as any).image ?? null;
        token.name = user.name ?? token.name;
      }
      // When client calls session.update, sync new values to token
      if (trigger === 'update' && session) {
        if ((session as any).image !== undefined) {
          (token as any).picture = (session as any).image;
        }
        if (session.name !== undefined) {
          token.name = session.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // Ensure latest picture and name propagate to session
        session.user.image = (token as any).picture ?? (session.user.image ?? null);
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};