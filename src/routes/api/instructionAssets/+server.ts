// src/routes/instructionAssets/api/+server.ts

import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

export const GET: RequestHandler = async () => {
    const instructionAssets = await prisma.instructionAsset.findMany();
    return new Response(JSON.stringify(instructionAssets), { status: 200 });
};

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    const instructionAsset = await prisma.instructionAsset.create({
        data: {
            instructionId: data.instructionId,
            assetId: data.assetId,
        },
    });
    return new Response(JSON.stringify(instructionAsset), { status: 201 });
};

export const DELETE: RequestHandler = async ({ request }) => {
    const { instructionId, assetId } = await request.json();
    await prisma.instructionAsset.delete({
        where: {
            instructionId_assetId: {
                instructionId: Number(instructionId),
                assetId: Number(assetId),
            },
        },
    });
    return new Response(null, { status: 204 });
};
