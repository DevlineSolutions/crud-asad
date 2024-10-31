import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

// Handle PATCH request to update a user
export const PATCH: RequestHandler = async ({ params, request }) => {
  const userId = parseInt(params.id);
  const { name } = await request.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name }
    });
    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response('Failed to update user', { status: 500 });
  }
};