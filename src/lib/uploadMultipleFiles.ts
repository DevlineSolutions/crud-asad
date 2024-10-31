// src/lib/uploadMultipleFiles.ts
import { supabase } from './supabaseClient';

export async function uploadFiles(files: File[], bucketName: string, folderPath = '') {
    const uploadResults = [];

    for (const file of files) {
        const filePath = `${folderPath}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file);

        if (error) {
            console.error(`Error uploading ${file.name}:`, error.message);
            uploadResults.push({ file: file.name, success: false, error: error.message });
        } else {
            const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            const publicUrl = publicUrlData?.publicUrl;

            uploadResults.push({ file: file.name, success: true, url: publicUrl, path: filePath });
        }
    }

    return uploadResults;
}