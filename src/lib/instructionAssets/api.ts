// src/lib/api/instructionAssets.ts

import type { InstructionAsset } from '../types';

export async function fetchInstructionAssets(): Promise<InstructionAsset[]> {
    const response = await fetch('/api/instructionAssets');
    return await response.json();
}

export async function createInstructionAsset(data: Partial<InstructionAsset>): Promise<InstructionAsset | false> {
    try {
        const response = await fetch('/api/instructionAssets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            return false;
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to create InstructionAsset:', error);
        return false;
    }
}

export async function deleteInstructionAsset(instructionId: number, assetId: number): Promise<boolean> {
    try {
        const response = await fetch('/api/instructionAssets', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instructionId, assetId }),
        });
        return response.ok;
    } catch (error) {
        console.error('Failed to delete InstructionAsset:', error);
        return false;
    }
}
