// src/routes/assets/api/+server.ts

import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

export const GET: RequestHandler = async () => {
    const assets = await prisma.asset.findMany({ where: { deletedBy: null } });
    return new Response(JSON.stringify(assets), { status: 200 });
};

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    const asset = await prisma.asset.create({ data });
    return new Response(JSON.stringify(asset), { status: 201 });
};

export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const { id, user } = await request.json();

        const relatedEntries = await prisma.instructionAsset.findFirst({
            where: { assetId: Number(id) }
        });

        if (relatedEntries) {
            return new Response(JSON.stringify({
                error: "Cannot delete asset that is referenced by other entries."
            }), { status: 400 });
        }

        await prisma.asset.update({
            where: { id: Number(id) },
            data: { deletedAt: new Date(), deletedBy: user },
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting asset:', error);
        return new Response(JSON.stringify({
            error: "Server error while deleting asset."
        }), { status: 500 });
    }
};