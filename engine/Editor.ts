import { Camera2D } from "./objects/Camera2D";
import { MapObject, ObjectType } from "./objects/MapObject";
import { WebGL2Renderer } from "./renderers/WebGL2Renderer";
import { hexToClearColor } from "./utils/Utils";
import type { GameObject } from '~/types/GameObject';

export interface AssetInfo {
    name: string, 
    path: string
}

export class Editor {
    private canvas: HTMLCanvasElement;
    private renderer: WebGL2Renderer;
    private camera: Camera2D;

    private lastTime: number = 0;
    private animationFrameId: number = 0;
    private gameObjects: Array<MapObject> = [];

    private assets: Array<AssetInfo> = [];
    public selectedAsset: AssetInfo = {} as AssetInfo;
    private currentObject: MapObject = {} as MapObject;

    constructor(windowId: string, mapObjects: Array<GameObject>, assets: Array<AssetInfo>) {
        this.canvas = document.getElementById(windowId) as HTMLCanvasElement;

        this.renderer = new WebGL2Renderer(this.canvas);
        this.camera = new Camera2D(this.canvas.width, this.canvas.height);

        this.assets = assets;

        window.addEventListener("beforeunload", () => {
            this.destroy();
        });

        this.setupEventListeners();

        this.loadResources().then(() => {
        }).catch(error => {
            console.error('[RES-MANAGER] Failed to load resource:', error);
        });

        this.start();
    }

    private setupEventListeners(): void {
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.camera.updateViewport(this.canvas.width, this.canvas.height);
            this.renderer.resize(this.canvas.width, this.canvas.height);
        });

        this.canvas.addEventListener("mousemove", (event: MouseEvent) => {
            this.currentObject.x = 0;
            this.currentObject.y = 0;
        });

        const keys: Set<string> = new Set();
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            keys.add(e.key.toLowerCase());
        });
        
        window.addEventListener('keyup', (e: KeyboardEvent) => {
            keys.delete(e.key.toLowerCase());
        });

        if (keys.has('arrowup')){
            this.camera.move(0, 10);
        }

        if (keys.has('arrowdown')){
            this.camera.move(0, -10);
        }

        if (keys.has('arrowleft')){
            this.camera.move(-10, 0);
        }

        if (keys.has('arrowright')){
            this.camera.move(10, 0);
        }
    }

    public setGameObjects(mapObjects: Array<GameObject>): void {
        
    }

    public setCurrentObject(newAsset: AssetInfo): void {
        this.currentObject = {} as MapObject; 
        this.currentObject = new MapObject(newAsset.name, 0, 0, ObjectType.TEXTURED);
        const objectTexture = this.renderer.getTextureManager().getTexture(newAsset.name);

        if (objectTexture) {
            this.currentObject.width = objectTexture.width;
            this.currentObject.height = objectTexture.height;
            this.currentObject.layer = 100;

            this.currentObject.setTexture(objectTexture, newAsset.name);
            this.selectedAsset = newAsset;

            const color = hexToClearColor("#00DE0A");
            this.currentObject.setTint(color.red, color.green, color.blue, color.alpha);

            this.gameObjects.push(this.currentObject);
        }
    }

    private async loadResources(): Promise<void> {
        let resourcePromises = [];

        if (this.assets)
        {
            for (let asset of this.assets)
            {
                resourcePromises.push(this.renderer.loadTexture(asset.name, asset.path));
            }
        }
        
        await Promise.all(resourcePromises.filter(p => p));
    }

    private start(): void {
        this.lastTime = performance.now();
        this.gameLoop();
    }

    private gameLoop = (): void => {
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.render();
    }

    private render(): void {
        const color = hexToClearColor("#23CD2A");
        this.renderer.clear(color.red, color.green, color.blue, color.alpha);

        const projectionMatrix = this.camera.getProjectionMatrix();
        const viewMatrix = this.camera.getViewMatrix();

        const sortedObjects = [...this.gameObjects].sort((a, b) => a.layer - b.layer);

        sortedObjects.forEach(obj => {
            this.renderer.renderGameObject(obj, projectionMatrix, viewMatrix);
        });
    }

    private destroy(): void {
        this.renderer.cleanup();
    }
}