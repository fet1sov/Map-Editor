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

    private keys: Set<string> = new Set();

    constructor(windowId: string, mapObjects: Array<GameObject>) {
        this.canvas = document.getElementById(windowId) as HTMLCanvasElement;

        this.renderer = new WebGL2Renderer(this.canvas);
        this.camera = new Camera2D(this.canvas.width, this.canvas.height);

        this.camera.setPosition(0, 0);

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.updateViewport(this.canvas.width, this.canvas.height);
        this.renderer.resize(this.canvas.width, this.canvas.height);

        window.addEventListener("beforeunload", () => {
            this.destroy();
        });

        this.setupEventListeners();

        this.loadResources().then(() => {
            this.start();
        }).catch(error => {
            console.error('[RES-MANAGER] Failed to load resource:', error);
            this.start();
        });
    }

    private setupEventListeners(): void {
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.camera.updateViewport(this.canvas.width, this.canvas.height);
            this.renderer.resize(this.canvas.width, this.canvas.height);
        });

        this.canvas.addEventListener("mousemove", (event: MouseEvent) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const worldPos = this.camera.screenToWorld(mouseX, mouseY);

            this.currentObject.x = worldPos[0];
            this.currentObject.y = worldPos[1];
        });

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            e.preventDefault();
            this.keys.add(e.key.toLowerCase());
        });
        
        window.addEventListener('keyup', (e: KeyboardEvent) => {
            e.preventDefault();
            this.keys.delete(e.key.toLowerCase());
        });

        this.canvas.addEventListener('click', (e: MouseEvent) => {
            e.preventDefault();
            
            const mapObject = new MapObject(this.currentObject.id, this.currentObject.x, this.currentObject.y, ObjectType.TEXTURED);
            const objectTexture = this.renderer.getTextureManager().getTexture(this.currentObject.textureName);

            if (objectTexture) {
                mapObject.width = objectTexture.width;
                mapObject.height = objectTexture.height;

                mapObject.setTexture(objectTexture, this.currentObject.textureName);

                this.gameObjects.push(mapObject);
            }
        });
    }

    public setGameObjects(mapObjects: Array<GameObject>): void {
        for (let object of mapObjects)
        {
            const mapObject = new MapObject(object.name, object.x, object.y, ObjectType.TEXTURED);
            const objectTexture = this.renderer.getTextureManager().getTexture(object.asset);

            if (objectTexture) {
                mapObject.width = objectTexture.width;
                mapObject.height = objectTexture.height;

                mapObject.setTexture(objectTexture, object.asset);

                this.gameObjects.push(mapObject);
            }
        }
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
        const resources = await fetch("/api/files");
        this.assets = JSON.parse(await resources.text());

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
        
        if (this.keys.has("arrowup")) {
            this.camera.move(0, 10);
        }

        if (this.keys.has("arrowdown")) {
            this.camera.move(0, -10);
        }

        if (this.keys.has("arrowright")) {
            this.camera.move(10, 0);
        }

        if (this.keys.has("arrowleft")) {
            this.camera.move(-10, 0);
        }

        this.render();
    }

    private render(): void {
        const color = hexToClearColor("#4b4b4b");
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