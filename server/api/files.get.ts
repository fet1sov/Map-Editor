import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async () => {
    const dirPath = join(process.cwd(), 'public/assets');
    const files = await readdir(dirPath);

    const pngFiles = files
        .filter(file => file.toLowerCase().endsWith('.png'))
        .map(file => ({
            name: file.split(".")[0],
            path: join('/assets', file).replaceAll('\\', '/')
        }));

    return pngFiles;
})