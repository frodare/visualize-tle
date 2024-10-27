varying vec2 vUv;
uniform sampler2D texture1;
uniform float side;
// uniform vec2 uViewportSize;

float uViewportSize = 300.0;

float tvNoise (vec2 p, float ta, float tb) {
  return fract(sin(p.x * ta + p.y * tb) * 5678.);
}
vec3 draw(sampler2D image, vec2 uv) {
  return texture2D(image,vec2(uv.x, uv.y)).rgb;   
}
float rand(vec2 co){
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// vec3 blur(vec2 uv, sampler2D image, float blurAmount){
//   vec3 blurredImage = vec3(0.);
//   // float d = smoothstep(0.8, 0.0, (gl_FragCoord.y / uViewportSize.y) / uViewportSize.y);
//   float d = smoothstep(0.8, 0.0, (gl_FragCoord.y / uViewportSize) / uViewportSize);
//   #define repeats 40.
//   for (float i = 0.; i < repeats; i++) { 
//     vec2 q = vec2(cos(degrees((i / repeats) * 360.)), sin(degrees((i / repeats) * 360.))) * (rand(vec2(i, uv.x + uv.y)) + blurAmount); 
//     vec2 uv2 = uv + (q * blurAmount * d);
//     blurredImage += draw(image, uv2) / 2.;
//     q = vec2(cos(degrees((i / repeats) * 360.)), sin(degrees((i / repeats) * 360.))) * (rand(vec2(i + 2., uv.x + uv.y + 24.)) + blurAmount); 
//     uv2 = uv + (q * blurAmount * d);
//     blurredImage += draw(image, uv2) / 2.;
//   }
//   return blurredImage / repeats;
// }

float blur(vec2 uv, sampler2D image, float blurAmount){
  // vec3 blurredImage = vec3(0.);
  // float d = smoothstep(0.8, 0.0, (gl_FragCoord.y / uViewportSize.y) / uViewportSize.y);
  // float d = smoothstep(0.8, 0.0, (gl_FragCoord.y / uViewportSize) / uViewportSize);
  #define repeats 2.
  float avg = 0.0;
  for (float u = -repeats; u < repeats; u++) { 
    for (float v = -repeats; v < repeats; v++) {
      vec2 offset = vec2(u, v) * 0.001;

      float d = texture2D(image, uv + offset).r;
      d *= 1. - abs(clamp(distance(vec2(0), vec2(u, v)) / 4.0, 0.0, 1.0));

      avg += d; // * (1.0 / (distance(uv, offset) * 5.));

      // vec2 q = vec2(cos(degrees((i / repeats) * 360.)), sin(degrees((i / repeats) * 360.))) * (rand(vec2(i, uv.x + uv.y)) + blurAmount); 
      // vec2 uv2 = uv + (q * blurAmount * d);
      // blurredImage += draw(image, uv2) / 2.;
      // q = vec2(cos(degrees((i / repeats) * 360.)), sin(degrees((i / repeats) * 360.))) * (rand(vec2(i + 2., uv.x + uv.y + 24.)) + blurAmount); 
      // uv2 = uv + (q * blurAmount * d);
      // blurredImage += draw(image, uv2) / 2.;
    }
  }
  // avg = step(0.2, texture2D(image, vec2(uv)).r) / 10.0;
  return avg / 20.0;
}

void main() {
  float lineSize = 0.001;
  vec4 tex = texture2D( texture1, vUv );
  // float glow = 
  float val = step(0.2, abs(tex.r)) * (abs(side - 1.75) * 0.5);
  // float equator = 1.0 - step(lineSize, abs(vUv.y - 0.5));
  // float primeMeridian = 1.0 - step(lineSize, abs(vUv.x - 0.5));
  // float antimeridian = 1.0 - step(lineSize, abs(vUv.x));

  float lineColor = 1.0 - step(lineSize, abs(vUv.y - 0.5));
  // lineColor += 1.0 - step(lineSize, abs(vUv.y - 0.25));
  // lineColor += 1.0 - step(lineSize, abs(vUv.x - 0.5));
  // lineColor += 1.0 - step(lineSize, abs(vUv.x));
  // lineColor += 1.0 - step(lineSize, abs(vUv.x - 0.25));

  vec4 lines = vec4(lineColor * 0.05, 0.0, 0.0, lineColor);
  float glowAmount = blur(vUv, texture1, 0.01);
  vec4 glow = vec4(glowAmount * 3.0, 1.0 * glowAmount, 1.0 * glowAmount, glowAmount * 20.0);
  vec4 outline = vec4(0.0, val, 0.0, val);

  vec4 final = glow + outline + lines;

  // gl_FragColor = vec4(lines, val, 0.0, 1.); // vec4(0.5, vUv, 1.0);
  // gl_FragColor = outline + (glow * abs(side - 1.0)) + vec4(0.0, 0.0, 0.0, side * 1.0); //vec4(0.1, 0.1, 0.1, 0.0);
  gl_FragColor = outline + (glow * abs(side - 1.0)) +lines;
}