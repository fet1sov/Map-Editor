export const colorVertexShaderSource = `#version 300 es
    precision highp float;

    in vec2 a_position;
    in vec4 a_color;
    
    
    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform vec2 u_position;
    uniform vec2 u_size;
    uniform float u_alpha;
    uniform vec2 u_pivot;
    uniform float u_rotation;
    

    out vec4 v_color;

    void main() {
        vec2 pos = a_position;
                
        pos -= u_pivot;

        float cosRot = cos(u_rotation);
        float sinRot = sin(u_rotation);
        pos = vec2(
            pos.x * cosRot - pos.y * sinRot,
            pos.x * sinRot + pos.y * cosRot
        );
                        
        pos = pos * u_size + u_position;
        gl_Position = u_projection * u_view * vec4(pos, 0.0, 1.0);
        v_color = vec4(a_color.rgb, a_color.a * u_alpha);
    }
`;

export const colorFragmentShaderSource = `#version 300 es
    precision highp float;
    
    in vec4 v_color;
    out vec4 outColor;
    
    void main() {
        outColor = v_color;
    }
`;