import type { Texture } from "../utils/TextureManager";

export enum ObjectType {
    COLORED,
    TEXTURED
}

export interface AnimationProperties {
    name: string,
    frameY: number,
    frameX?: number
}

export interface AttachedObject {
    gameObject: MapObject,
    offsetX: number,
    offsetY: number
}

export class MapObject {
    public id: string;
    public x: number;
    public y: number;
    public width: number = 50;
    public height: number = 50;
    public color: number[] = [1.0, 1.0, 1.0, 1.0];
    public visible: boolean = true;
    public type: ObjectType = ObjectType.COLORED;
    public texture: Texture | null = null;
    public textureName: string = '';
    public textureCoords: number[] = [0, 0, 1, 1];
    public layer: number = 0;
    public alpha: number = 1.0;
    public tintColor: number[] = [1.0, 1.0, 1.0, 1.0];

    public maxCollisionDistance: number = 25;

    // Rotation properties
    public rotation: number = 0;
    public rotationDegrees: number = 0;
    public pivotX: number = 0.5;
    public pivotY: number = 0.5;
    
    // Animation properties
    public frame: number = 0;
    public frameCount: number = 1;
    public frameWidth: number = 1;
    public frameHeight: number = 1;
    public animationSpeed: number = 0;
    public animationTime: number = 0;

    constructor(id: string, x: number, y: number, type: ObjectType = ObjectType.COLORED) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
    }

    public setTexture(texture: Texture, textureName: string): void {
        this.texture = texture;
        this.textureName = textureName;
        this.type = ObjectType.TEXTURED;
        this.updateTextureCoords();
    }

    public updateTextureCoords(): void {
        this.textureCoords = [0, 0, 1, 1];
    }

    public setColor(r: number, g: number, b: number, a: number = 1.0): void {
        this.color = [r, g, b, a];
        this.type = ObjectType.COLORED;
    }

    public getPosition(): [number, number] {
        return [this.x, this.y];
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public getCenter(): [number, number] {
        return [this.x + this.width / 2, this.y + this.height / 2];
    }

    public containsPoint(px: number, py: number): boolean {
        return px >= this.x && 
               px <= this.x + this.width && 
               py >= this.y && 
               py <= this.y + this.height;
    }

    public getBounds(): { left: number; right: number; top: number; bottom: number } {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y + this.height,
            bottom: this.y
        };
    }

    public setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    public setAlpha(alpha: number): void {
        this.alpha = Math.max(0, Math.min(1, alpha));
    }

    public setTint(r: number, g: number, b: number, a: number = 1.0): void {
        this.tintColor = [r, g, b, a];
    }
}