export class Camera2D {
    public position: [number, number] = [0, 0];
    public zoom: number = 1.0;
    
    private viewportWidth: number;
    private viewportHeight: number;
    private followSmoothness: number = 0.1;
    private lastUpdateTime: number = 0;

    constructor(viewportWidth: number, viewportHeight: number) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.lastUpdateTime = performance.now();
    }

    public updateViewport(width: number, height: number): void {
        this.viewportWidth = width;
        this.viewportHeight = height;
    }

    public getProjectionMatrix(): number[] {
        // Create orthographic projection matrix (no rotation)
        const left = -this.viewportWidth / (2 * this.zoom);
        const right = this.viewportWidth / (2 * this.zoom);
        const bottom = -this.viewportHeight / (2 * this.zoom);
        const top = this.viewportHeight / (2 * this.zoom);
        const near = -1000;
        const far = 1000;

        // Column-major order for WebGL
        return [
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, -2 / (far - near), 0,
            -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1
        ];
    }

    public getViewMatrix(): number[] {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -this.position[0], -this.position[1], 0, 1
        ];
    }

    public screenToWorld(screenX: number, screenY: number): [number, number] {
        // Convert screen coordinates to world coordinates
        const x = (screenX / this.viewportWidth - 0.5) * (this.viewportWidth / this.zoom) + this.position[0];
        const y = (0.5 - screenY / this.viewportHeight) * (this.viewportHeight / this.zoom) + this.position[1];
        return [x, y];
    }

    public worldToScreen(worldX: number, worldY: number): [number, number] {
        // Convert world coordinates to screen coordinates
        const x = ((worldX - this.position[0]) * this.zoom / this.viewportWidth + 0.5) * this.viewportWidth;
        const y = (0.5 - (worldY - this.position[1]) * this.zoom / this.viewportHeight) * this.viewportHeight;
        return [x, y];
    }

    public reset(): void {
        this.position = [0, 0];
        this.zoom = 1.0;
    }

    public setPosition(x: number, y: number): void {
        this.position[0] = x;
        this.position[1] = y;
    }

    public move(x: number, y: number): void {
        this.position[0] += x;
        this.position[1] += y;
    }

    public setZoom(zoom: number): void {
        this.zoom = Math.max(0.1, Math.min(10, zoom));
    }

    public getViewportBounds(): { left: number; right: number; top: number; bottom: number } {
        const halfWidth = this.viewportWidth / (2 * this.zoom);
        const halfHeight = this.viewportHeight / (2 * this.zoom);
        
        return {
            left: this.position[0] - halfWidth,
            right: this.position[0] + halfWidth,
            top: this.position[1] + halfHeight,
            bottom: this.position[1] - halfHeight
        };
    }

    public isInView(x: number, y: number, width: number, height: number): boolean {
        const bounds = this.getViewportBounds();
        
        return !(x + width < bounds.left ||
                x > bounds.right ||
                y + height < bounds.bottom ||
                y > bounds.top);
    }
}