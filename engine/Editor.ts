import { Camera2D } from "./objects/Camera2D";
import { MapObject, ObjectType } from "./objects/MapObject";
import { WebGL2Renderer } from "./renderers/WebGL2Renderer";
import { hexToClearColor } from "./utils/Utils";
import type { GameObject } from '~/types/GameObject';

export class Editor {
    private canvas: HTMLCanvasElement;
    private renderer: WebGL2Renderer;
    private camera: Camera2D;

    private gameObjects: Array<GameObject>;

    constructor(windowId: string, mapObjects: Array<GameObject>) {
        this.canvas = document.getElementById(windowId) as HTMLCanvasElement;

        this.renderer = new WebGL2Renderer(this.canvas);
        this.camera = new Camera2D(this.canvas.width, this.canvas.height);

        window.addEventListener("beforeunload", () => {
            this.destroy();
        });

        this.setupEventListeners();

        this.start();
    }


    private setupEventListeners(): void {
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.camera.updateViewport(this.canvas.width, this.canvas.height);
            this.renderer.resize(this.canvas.width, this.canvas.height);
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

    public setGameObjects(mapObjects: Array<GameObjects>): void {
        this.gameObjects = mapObjects;
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
        
        // TODO: Make the update and render things right there

        //this.update(deltaTime);
        this.render();
    }

    private render(): void {
        const color = hexToClearColor("#23CD2A");
        this.renderer.clear(color.red, color.green, color.blue, color.alpha);

        
    }
}