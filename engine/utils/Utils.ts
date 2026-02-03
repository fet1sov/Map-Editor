interface hexToGLColor {
    red: number,
    green: number,
    blue: number,
    alpha: number
}

export interface FontData {
    texture: WebGLTexture,
    charMap: Map<string, { x: number, y: number, width: number, height: number, pixelWidth: number, pixelHeight: number }>
}

export function hexToClearColor(hex: string, alpha = 1.0): hexToGLColor {
    hex = hex.replace(/^#/, '');

    return {
        red: parseInt(hex.substring(0, 2), 16) / 255,
        green: parseInt(hex.substring(2, 4), 16) / 255,
        blue: parseInt(hex.substring(4, 6), 16) / 255,
        alpha: alpha
    } as hexToGLColor;
}

export function readJSONFile(file: URL, callback: (response: string) => void) {
    let rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4 && rawFile.status == 200) {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
}

export function createFontTexture(gl: WebGL2RenderingContext, fontFamily: string = "Arial", fontSize: number = 64) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/~`\'" ';
    const charMap = new Map<string, { x: number, y: number, width: number, height: number, pixelWidth: number, pixelHeight: number }>();
    const padding = 2;

    let x = padding;
    let y = padding;
    let maxHeight = 0;

    for (let char of chars) {
        const metrics = ctx.measureText(char);
        const charWidth = metrics.width;
        const charHeight = fontSize;

        if (x + charWidth + padding > canvas.width) {
            x = padding;
            y += maxHeight + padding;
            maxHeight = 0;
        }

        ctx.fillText(char, x, y);

        charMap.set(char, {
            x: x / canvas.width,
            y: y / canvas.height,
            width: charWidth / canvas.width,
            height: charHeight / canvas.height,
            pixelWidth: charWidth,
            pixelHeight: charHeight
        });

        x += charWidth + padding;
        maxHeight = Math.max(maxHeight, charHeight);
    }

    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return { texture, charMap };
}

export function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error('Failed to create shader');
    }
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(`Shader compilation failed: ${gl.getShaderInfoLog(shader)}`);
    }
    
    return shader;
}