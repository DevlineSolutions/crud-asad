// src/lib/api/assets.ts

import type { Asset } from '../types';

export async function fetchAssets(): Promise<Asset[]> {
    const response = await fetch('/api/assets');
    return await response.json();
}

export async function createAsset(data: Partial<Asset>): Promise<Asset> {
    const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return await response.json();
}

export async function updateAsset(id: number, data: Partial<Asset>): Promise<Asset> {
    const response = await fetch(`/api/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return await response.json();
}

export async function deleteAsset(id: number, user: number | undefined): Promise<boolean> {
    try {
        const response = await fetch('/api/assets', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, user }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete asset');
        }

        return true;
    } catch (error) {
        console.error('Failed to delete asset:', error);
        throw new Error(error instanceof Error ? error.message : 'Unexpected error');
    }
}
