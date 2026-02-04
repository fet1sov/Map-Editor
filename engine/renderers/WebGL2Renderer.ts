import { ObjectType, MapObject } from "../objects/MapObject";
import { colorFragmentShaderSource, colorVertexShaderSource } from "../shaders/ColorShaders";
import { textureFragmentShaderSource, textureVertexShaderSource } from "../shaders/TextureShaders";
import { TextureManager } from "../utils/TextureManager";
import { createShader } from "../utils/Utils";

export class WebGL2Renderer {
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram | null = null;
    private textureProgram: WebGLProgram | null = null;
    private vertexBuffer: WebGLBuffer | null = null;
    private vertexArrayObject: WebGLVertexArrayObject | null = null;
    private textureManager: TextureManager;
    
    // Uniform locations
    private projectionLocation: WebGLUniformLocation | null = null;
    private viewLocation: WebGLUniformLocation | null = null;
    private positionLocation: WebGLUniformLocation | null = null;
    private sizeLocation: WebGLUniformLocation | null = null;
    private colorLocation: WebGLUniformLocation | null = null;
    private alphaLocation: WebGLUniformLocation | null = null;
    private rotationLocation: WebGLUniformLocation | null = null;
    private pivotLocation: WebGLUniformLocation | null = null;
    
    // Texture program uniforms
    private texProjectionLocation: WebGLUniformLocation | null = null;
    private texViewLocation: WebGLUniformLocation | null = null;
    private texPositionLocation: WebGLUniformLocation | null = null;
    private texSizeLocation: WebGLUniformLocation | null = null;
    private texColorLocation: WebGLUniformLocation | null = null;
    private texAlphaLocation: WebGLUniformLocation | null = null;
    private texTintLocation: WebGLUniformLocation | null = null;
    private texSamplerLocation: WebGLUniformLocation | null = null;
    private texCoordsLocation: WebGLUniformLocation | null = null;
    private texRotationLocation: WebGLUniformLocation | null = null;
    private texPivotLocation: WebGLUniformLocation | null = null;

    constructor(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext('webgl2');
        if (!gl) {
            throw new Error('WebGL2 not supported');
        }
        this.gl = gl;
        
        this.textureManager = new TextureManager(gl);
        
        this.initShaders();
        this.initBuffers();
        this.configureGL();
    }

    private initShaders(): void {
        const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, colorVertexShaderSource);
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, colorFragmentShaderSource);
        
        this.program = this.gl.createProgram();
        if (!this.program) {
            throw new Error('Failed to create shader program');
        }
        
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw new Error(`Color shader program link failed: ${this.gl.getProgramInfoLog(this.program)}`);
        }
        
        // Create texture shader program
        const textureVertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, textureVertexShaderSource);
        const textureFragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, textureFragmentShaderSource);
        
        this.textureProgram = this.gl.createProgram();
        if (!this.textureProgram) {
            throw new Error('Failed to create texture shader program');
        }
        
        this.gl.attachShader(this.textureProgram, textureVertexShader);
        this.gl.attachShader(this.textureProgram, textureFragmentShader);
        this.gl.linkProgram(this.textureProgram);
        
        if (!this.gl.getProgramParameter(this.textureProgram, this.gl.LINK_STATUS)) {
            throw new Error(`Texture shader program link failed: ${this.gl.getProgramInfoLog(this.textureProgram)}`);
        }
        
        // Get uniform locations for color program
        this.gl.useProgram(this.program);
        this.projectionLocation = this.gl.getUniformLocation(this.program, 'u_projection');
        this.viewLocation = this.gl.getUniformLocation(this.program, 'u_view');
        this.positionLocation = this.gl.getUniformLocation(this.program, 'u_position');
        this.sizeLocation = this.gl.getUniformLocation(this.program, 'u_size');
        this.colorLocation = this.gl.getUniformLocation(this.program, 'u_color');
        this.alphaLocation = this.gl.getUniformLocation(this.program, 'u_alpha');
        this.rotationLocation = this.gl.getUniformLocation(this.program, 'u_rotation');
        this.pivotLocation = this.gl.getUniformLocation(this.program, 'u_pivot');
        
        // Get uniform locations for texture program
        this.gl.useProgram(this.textureProgram);
        this.texProjectionLocation = this.gl.getUniformLocation(this.textureProgram, 'u_projection');
        this.texViewLocation = this.gl.getUniformLocation(this.textureProgram, 'u_view');
        this.texPositionLocation = this.gl.getUniformLocation(this.textureProgram, 'u_position');
        this.texSizeLocation = this.gl.getUniformLocation(this.textureProgram, 'u_size');
        this.texColorLocation = this.gl.getUniformLocation(this.textureProgram, 'u_color');
        this.texAlphaLocation = this.gl.getUniformLocation(this.textureProgram, 'u_alpha');
        this.texTintLocation = this.gl.getUniformLocation(this.textureProgram, 'u_tint');
        this.texSamplerLocation = this.gl.getUniformLocation(this.textureProgram, 'u_texture');
        this.texCoordsLocation = this.gl.getUniformLocation(this.textureProgram, 'u_texcoords');
        this.texRotationLocation = this.gl.getUniformLocation(this.textureProgram, 'u_rotation');
        this.texPivotLocation = this.gl.getUniformLocation(this.textureProgram, 'u_pivot');
        
        // Clean up shaders
        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);
        this.gl.deleteShader(textureVertexShader);
        this.gl.deleteShader(textureFragmentShader);
        
        this.gl.useProgram(null);
    }

    private initBuffers(): void {
        // Create vertex buffer for colored rectangles (position + color)
        const colorVertices = new Float32Array([
            // Positions (x, y) and Colors (r, g, b, a)
            // First triangle
            -0.5, -0.5,  1, 1, 1, 1,
             0.5, -0.5,  1, 1, 1, 1,
            -0.5,  0.5,  1, 1, 1, 1,
            
            // Second triangle
            -0.5,  0.5,  1, 1, 1, 1,
             0.5, -0.5,  1, 1, 1, 1,
             0.5,  0.5,  1, 1, 1, 1
        ]);

        // Create vertex buffer for textured rectangles (position + texcoord)
        const textureVertices = new Float32Array([
            // Positions (x, y) and Texture Coordinates (u, v)
            // First triangle
            -0.5, -0.5,  0.0, 1.0,
             0.5, -0.5,  1.0, 1.0,
            -0.5,  0.5,  0.0, 0.0,
            
            // Second triangle
            -0.5,  0.5,  0.0, 0.0,
             0.5, -0.5,  1.0, 1.0,
             0.5,  0.5,  1.0, 0.0
        ]);

        // Create VAO for colored objects
        this.vertexArrayObject = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vertexArrayObject);

        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, colorVertices, this.gl.STATIC_DRAW);

        // Position attribute for color program
        this.gl.useProgram(this.program);
        const positionLocation = this.gl.getAttribLocation(this.program!, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(
            positionLocation,
            2, // size (x, y)
            this.gl.FLOAT,
            false,
            6 * Float32Array.BYTES_PER_ELEMENT, // stride
            0 // offset
        );

        // Color attribute for color program
        const colorLocation = this.gl.getAttribLocation(this.program!, 'a_color');
        this.gl.enableVertexAttribArray(colorLocation);
        this.gl.vertexAttribPointer(
            colorLocation,
            4, // size (r, g, b, a)
            this.gl.FLOAT,
            false,
            6 * Float32Array.BYTES_PER_ELEMENT, // stride
            2 * Float32Array.BYTES_PER_ELEMENT // offset
        );

        // Create separate buffer for texture coordinates
        const textureBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, textureVertices, this.gl.STATIC_DRAW);

        // Position attribute for texture program
        this.gl.useProgram(this.textureProgram);
        const texPositionLocation = this.gl.getAttribLocation(this.textureProgram!, 'a_position');
        this.gl.enableVertexAttribArray(texPositionLocation);
        this.gl.vertexAttribPointer(
            texPositionLocation,
            2, // size (x, y)
            this.gl.FLOAT,
            false,
            4 * Float32Array.BYTES_PER_ELEMENT, // stride
            0 // offset
        );

        // Texture coordinate attribute for texture program
        const texCoordLocation = this.gl.getAttribLocation(this.textureProgram!, 'a_texcoord');
        this.gl.enableVertexAttribArray(texCoordLocation);
        this.gl.vertexAttribPointer(
            texCoordLocation,
            2, // size (u, v)
            this.gl.FLOAT,
            false,
            4 * Float32Array.BYTES_PER_ELEMENT, // stride
            2 * Float32Array.BYTES_PER_ELEMENT // offset
        );

        // Unbind
        this.gl.bindVertexArray(null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.useProgram(null);
        
        // Clean up
        this.gl.deleteBuffer(textureBuffer);
    }

    private configureGL(): void {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearColor(0.1, 0.1, 0.2, 1.0);
    }

    public clear(r?: number, g?: number, b?: number, a?: number): void {
        if (r !== undefined && g !== undefined && b !== undefined && a !== undefined) {
            this.gl.clearColor(r, g, b, a);
        }
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    public renderGameObject(
        gameObject: MapObject,
        projectionMatrix: number[],
        viewMatrix: number[]
    ): void {
        if (!gameObject.visible) return;

        if (gameObject.type === ObjectType.COLORED) {
            this.renderColoredObject(gameObject, projectionMatrix, viewMatrix);
        } else {
            this.renderTexturedObject(gameObject, projectionMatrix, viewMatrix);
        }
    }

    private renderColoredObject(
        gameObject: MapObject,
        projectionMatrix: number[],
        viewMatrix: number[]
    ): void {
        if (!this.program || !this.vertexArrayObject) return;

        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vertexArrayObject);

        // Set uniforms
        this.gl.uniformMatrix4fv(this.projectionLocation, false, projectionMatrix);
        this.gl.uniformMatrix4fv(this.viewLocation, false, viewMatrix);
        this.gl.uniform2f(this.positionLocation, gameObject.x + gameObject.width / 2, gameObject.y + gameObject.height / 2);
        this.gl.uniform2f(this.sizeLocation, gameObject.width, gameObject.height);
        this.gl.uniform4f(this.colorLocation, 
            gameObject.color[0], 
            gameObject.color[1], 
            gameObject.color[2], 
            gameObject.color[3]
        );
        this.gl.uniform1f(this.alphaLocation, gameObject.alpha);
        this.gl.uniform1f(this.rotationLocation, gameObject.rotation);
        this.gl.uniform2f(this.pivotLocation, gameObject.pivotX - 0.5, gameObject.pivotY - 0.5);

        // Update vertex colors
        const vertices = new Float32Array([
            // First triangle
            -0.5, -0.5,  gameObject.color[0], gameObject.color[1], gameObject.color[2], gameObject.color[3],
             0.5, -0.5,  gameObject.color[0], gameObject.color[1], gameObject.color[2], gameObject.color[3],
            -0.5,  0.5,  gameObject.color[0], gameObject.color[1], gameObject.color[2], gameObject.color[3],
            
            // Second triangle
            -0.5,  0.5,  gameObject.color[0], gameObject.color[1], gameObject.color[2], gameObject.color[3],
             0.5, -0.5,  gameObject.color[0], gameObject.color[1], gameObject.color[2], gameObject.color[3],
             0.5,  0.5,  gameObject.color[0], gameObject.color[1], gameObject.color[2], gameObject.color[3]
        ]);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        // Draw the rectangle
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        // Cleanup
        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }

    private renderTexturedObject(
        gameObject: MapObject,
        projectionMatrix: number[],
        viewMatrix: number[]
    ): void {
        if (!this.textureProgram || !this.vertexArrayObject || !gameObject.texture) return;

        this.gl.useProgram(this.textureProgram);
        this.gl.bindVertexArray(this.vertexArrayObject);

        // Bind texture
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, gameObject.texture.id);
        
        // Set uniforms
        this.gl.uniformMatrix4fv(this.texProjectionLocation, false, projectionMatrix);
        this.gl.uniformMatrix4fv(this.texViewLocation, false, viewMatrix);
        this.gl.uniform2f(this.texPositionLocation, gameObject.x + gameObject.width / 2, gameObject.y + gameObject.height / 2);
        this.gl.uniform2f(this.texSizeLocation, gameObject.width, gameObject.height);
        this.gl.uniform4f(this.texTintLocation, 
            gameObject.tintColor[0], 
            gameObject.tintColor[1], 
            gameObject.tintColor[2], 
            gameObject.tintColor[3]
        );
        this.gl.uniform1f(this.texAlphaLocation, gameObject.alpha);
        this.gl.uniform1i(this.texSamplerLocation, 0);
        this.gl.uniform4f(this.texCoordsLocation, 
            gameObject.textureCoords[0],
            gameObject.textureCoords[1],
            gameObject.textureCoords[2],
            gameObject.textureCoords[3]
        );
        this.gl.uniform1f(this.texRotationLocation, gameObject.rotation);
        this.gl.uniform2f(this.texPivotLocation, gameObject.pivotX - 0.5, gameObject.pivotY - 0.5);

        // Draw the textured rectangle
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        // Cleanup
        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }

    public loadTexture(name: string, url: string): Promise<void> {
        return this.textureManager.loadTexture(name, url).then(() => {});
    }

    public loadTextureFromElement(name: string, imageElement: HTMLImageElement): void {
        this.textureManager.loadTextureFromElement(name, imageElement);
    }

    public getTextureManager(): TextureManager {
        return this.textureManager;
    }

    public resize(width: number, height: number): void {
        this.gl.viewport(0, 0, width, height);
    }

    public getContext(): WebGL2RenderingContext {
        return this.gl;
    }

    public cleanup(): void {
        if (this.vertexBuffer) {
            this.gl.deleteBuffer(this.vertexBuffer);
        }
        if (this.vertexArrayObject) {
            this.gl.deleteVertexArray(this.vertexArrayObject);
        }
        if (this.program) {
            this.gl.deleteProgram(this.program);
        }
        if (this.textureProgram) {
            this.gl.deleteProgram(this.textureProgram);
        }
        this.textureManager.cleanup();
    }
}