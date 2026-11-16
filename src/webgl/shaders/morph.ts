import { simplexNoise3D } from './noise'

export const morphVertex = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uTurb;
uniform float uSize;
uniform float uPixelRatio;
uniform float uOpacity;
uniform vec3  uMouse;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform float uPhoto;   // 0 → shape gradient, 1 → per-particle portrait colours
uniform float uReveal;  // 0..1 while the source photo is shown under the portrait

attribute vec3  aFrom;
attribute vec3  aTo;
attribute float aSeed;
attribute vec3  aColor;

varying vec3  vColor;
varying float vAlpha;

${simplexNoise3D}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void main() {
  // Staggered morph: each particle starts a little later based on its seed.
  // Keep in sync with localProgress() in Morph.tsx.
  float t = easeInOutCubic(clamp(uProgress * 1.5 - aSeed * 0.5, 0.0, 1.0));
  vec3 p = mix(aFrom, aTo, t);

  // In-flight particles swirl through a noise field, then settle into the shape.
  float flight = sin(t * 3.14159265);
  float n = aSeed * 20.0;
  float tt = uTime * 0.15;
  vec3 flow = vec3(
    snoise(p * 0.8 + vec3(n, tt, 0.0)),
    snoise(p * 0.8 + vec3(0.0, n, tt) + 13.1),
    snoise(p * 0.8 + vec3(tt, 0.0, n) + 27.3)
  );
  p += flow * (0.012 + uTurb * 0.05 + flight * 0.6);

  // Cursor pushes particles away and toward the camera.
  vec2 d = p.xy - uMouse.xy;
  float dist = length(d);
  float push = smoothstep(0.75, 0.0, dist);
  p.xy += (d / max(dist, 0.0001)) * push * 0.3;
  p.z += push * 0.35;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  // Portrait uses slightly finer points so facial detail reads.
  gl_PointSize = uSize * (0.45 + aSeed * 0.9) * (1.0 + flight * 0.6) * mix(1.0, 0.78, uPhoto) * uPixelRatio / -mv.z;

  // Diagonal gradient across the shape, brighter while flying or pushed.
  float g = clamp(0.5 + p.x * 0.3 + p.y * 0.2 + (aSeed - 0.5) * 0.35, 0.0, 1.0);
  vec3 base = mix(mix(uColorA, uColorB, g), aColor, uPhoto);
  vColor = base + (flight * 0.25 + push * 0.35);
  vAlpha = uOpacity * mix(0.5 + 0.5 * aSeed, 0.7 + 0.3 * aSeed, uPhoto) * (1.0 - uReveal * 0.3);
}
`

export const morphFragment = /* glsl */ `
varying vec3  vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = pow(smoothstep(0.5, 0.0, d), 1.6);
  gl_FragColor = vec4(vColor, a * vAlpha);
  #include <colorspace_fragment>
}
`
