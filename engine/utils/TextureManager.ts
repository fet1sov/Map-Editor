export interface Texture {
    id: WebGLTexture;
    width: number;
    height: number;
    loaded: boolean;
    image?: HTMLImageElement;
}

export class TextureManager {
    private gl: WebGL2RenderingContext;
    private textures: Map<string, Texture> = new Map();
    private defaultTexture: WebGLTexture | null = null;
    private whitePixel: Uint8Array = new Uint8Array([255, 255, 255, 255]);

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.createDefaultTexture();
    }

    private createDefaultTexture(): void {
        this.defaultTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.defaultTexture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            1,
            1,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            this.whitePixel
        );
        
        this.setTextureParameters(this.defaultTexture);
    }

    private setTextureParameters(texture: WebGLTexture): void {
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST_MIPMAP_LINEAR);
    }

    public loadTexture(name: string, url: string): Promise<Texture> {
        return new Promise((resolve, reject) => {
            if (this.textures.has(name)) {
                resolve(this.textures.get(name)!);
                return;
            }

            const image = new Image();
            image.crossOrigin = 'anonymous';
            
            image.onload = () => {
                const texture = this.createTextureFromImage(image);
                this.textures.set(name, texture);
                resolve(texture);
            };
            
            image.onerror = (error) => {
                console.error(`Failed to load texture: ${url}`, error);
                reject(new Error(`Failed to load texture: ${url}`));
            };
            
            image.src = url;
        });
    }

    public loadTextureFromElement(name: string, imageElement: HTMLImageElement): Texture {
        if (this.textures.has(name)) {
            return this.textures.get(name)!;
        }

        const texture = this.createTextureFromImage(imageElement);
        this.textures.set(name, texture);
        return texture;
    }

    private createTextureFromImage(image: HTMLImageElement): Texture {
        const texture = this.gl.createTexture();
        if (!texture) {
            throw new Error('Failed to create texture');
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            image
        );

        this.setTextureParameters(texture);

        const textureObj: Texture = {
            id: texture,
            width: image.width,
            height: image.height,
            loaded: true,
            image: image
        };

        return textureObj;
    }

    public createTexture(name: string, width: number, height: number, data?: ArrayBufferView): Texture {
        const texture = this.gl.createTexture();
        if (!texture) {
            throw new Error('Failed to create texture');
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        
        if (data) {
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,
                width,
                height,
                0,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                data
            );
        } else {
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,
                width,
                height,
                0,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                null
            );
        }

        this.setTextureParameters(texture);

        const textureObj: Texture = {
            id: texture,
            width,
            height,
            loaded: true
        };

        this.textures.set(name, textureObj);
        return textureObj;
    }

    public getTexture(name: string): Texture | null {
        return this.textures.get(name) || null;
    }

    public getDefaultTexture(): WebGLTexture {
        return this.defaultTexture!;
    }

    public bindTexture(name: string, unit: number = 0): boolean {
        const texture = this.textures.get(name);
        if (texture && texture.loaded) {
            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture.id);
            return true;
        }
        return false;
    }

    public bindTextureObject(texture: Texture, unit: number = 0): void {
        if (texture && texture.loaded) {
            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture.id);
        }
    }

    public cleanup(): void {
        this.textures.forEach(texture => {
            this.gl.deleteTexture(texture.id);
        });
        this.textures.clear();
        
        if (this.defaultTexture) {
            this.gl.deleteTexture(this.defaultTexture);
        }
    }

    public getTextureCount(): number {
        return this.textures.size;
    }

    public getTextureNames(): string[] {
        return Array.from(this.textures.keys());
    }

    public hasTexture(name: string): boolean {
        return this.textures.has(name);
    }
}