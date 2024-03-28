#version 300 es

precision highp float;

in vec4 aVertexPosition;
in vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out vec4 vColor;

void main(void)
{
    gl_Position = uProjectionMatrix*uModelViewMatrix*aVertexPosition;
    vColor = aVertexColor;
}