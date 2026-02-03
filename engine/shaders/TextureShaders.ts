export const textureVertexShaderSource = `#version 300 es
    precision highp float;
    
    in vec2 a_position;
    in vec2 a_texcoord;
    
    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform vec2 u_position;
    uniform vec2 u_size;
    uniform vec4 u_tint;
    uniform float u_alpha;
    uniform vec4 u_texcoords; // u1, v1, u2, v2
    uniform vec2 u_pivot;
    uniform float u_rotation;
    
    out vec2 v_texcoord;
    out vec4 v_tint;
    out float v_alpha;
    
    void main() {
        vec2 pos = a_position;

        pos -= u_pivot;
                
        float cosRot = cos(u_rotation);
        float sinRot = sin(u_rotation);
        vec2 rotatedPos = vec2(
            pos.x * cosRot - pos.y * sinRot,
            pos.x * sinRot + pos.y * cosRot
        );

        pos = rotatedPos * u_size + u_position;
        gl_Position = u_projection * u_view * vec4(pos, 0.0, 1.0);
        
        vec2 texRange = u_texcoords.zw - u_texcoords.xy;
        v_texcoord = u_texcoords.xy + a_texcoord * texRange;
        v_tint = u_tint;
        v_alpha = u_alpha;
    }
`;

export const textureFragmentShaderSource = `#version 300 es
    precision highp float;
    
    in vec2 v_texcoord;
    in vec4 v_tint;
    in float v_alpha;
    
    uniform sampler2D u_texture;
    
    out vec4 outColor;
    
    void main() {
        vec4 texColor = texture(u_texture, v_texcoord);
        outColor = texColor * v_tint * v_alpha;
        
        if (outColor.a < 0.01) {
            discard;
        }
    }
`;