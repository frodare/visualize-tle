uniform vec2 uvScale;
varying vec2 vUv;
uniform float side;

void main() {
  vUv = uv; //abs(1 - uv - (side * vec2(1, 0.0)));

  
  // float u = uv.x * (side * (1.0 - uv.x));
  // vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  // smoothstep(0.0, 1.0, 1.0);
  // gl_Position = projectionMatrix * mvPosition;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}