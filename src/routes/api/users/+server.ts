
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

// CREATE
export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  const user = await prisma.user.create({ data });
  return new Response(JSON.stringify(user), { status: 201 });
};

// READ (All)
export const GET: RequestHandler = async () => {
  const users = await prisma.user.findMany();
  return new Response(JSON.stringify(users));
};

// UPDATE
export const PATCH: RequestHandler = async ({ request }) => {
  const { id, ...data } = await request.json();
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data
  });
  return new Response(JSON.stringify(user));
};

// DELETE
export const DELETE: RequestHandler = async ({ request }) => {
  const { id } = await request.json();
  await prisma.user.delete({ where: { id: Number(id) } });
  return new Response(null, { status: 204 });
};
