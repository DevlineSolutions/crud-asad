// src/routes/steps/api/+server.ts

import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

export const GET: RequestHandler = async () => {
    const steps = await prisma.instruction.findMany({ where: { deletedBy: null } });
    return new Response(JSON.stringify(steps), { status: 200 });
};

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    const instruction = await prisma.instruction.create({ data });
    return new Response(JSON.stringify(instruction), { status: 201 });
};


export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const { id, user } = await request.json();

        const stepsWithInstruction = await prisma.step.findFirst({
            where: { instructionId: Number(id), deletedBy: null }
        });

        const assetRelationships = await prisma.instructionAsset.findFirst({
            where: { instructionId: Number(id) }
        });

        if (stepsWithInstruction || assetRelationships) {
            return new Response(JSON.stringify({
                error: "Cannot delete instruction that is referenced by steps or assets."
            }), { status: 400 });
        }

        await prisma.instruction.update({
            where: { id: Number(id) },
            data: { deletedAt: new Date(), deletedBy: user }
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting instruction:', error);
        return new Response(JSON.stringify({
            error: "Server error while deleting instruction."
        }), { status: 500 });
    }
};
