import { useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { PORTRAIT_HEIGHT } from './shapes'
import { sceneStates, store } from './sceneStore'

// The source photo, drawn behind the particle portrait in the same group, so the two are
// registered exactly. Hovering the About frame sweeps a scan line down that reveals it in a
// "cyber" treatment (scanlines, RGB split, glitch slices at the scan edge) — the particles stay
// on top, so you can see the photo they were sampled from.

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragment = /* glsl */ `
uniform sampler2D uTex;
uniform float uReveal;
uniform float uTime;
uniform vec3  uTint;
uniform vec3  uAccent;
varying vec2 vUv;

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  vec2 uv = vUv;
  // Scan line travels top → bottom; everything above it is revealed. Overshoots so it fully clears.
  float edge = 1.0 - uReveal * 1.12;
  float d = uv.y - edge;
  float nearEdge = smoothstep(0.14, 0.0, abs(d));

  // Glitch: rows near the scan line jitter sideways.
  float row = floor(uv.y * 110.0);
  float jitter = (hash(row + floor(uTime * 24.0)) - 0.5) * 0.05 * nearEdge;
  vec2 guv = vec2(uv.x + jitter, uv.y);

  // RGB split, strongest at the scan line.
  float split = 0.0025 + 0.018 * nearEdge;
  vec3 col = vec3(
    texture2D(uTex, guv + vec2(split, 0.0)).r,
    texture2D(uTex, guv).g,
    texture2D(uTex, guv - vec2(split, 0.0)).b
  );
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 cyber = mix(col, l * uTint, 0.28);
  cyber *= 0.9 + 0.1 * sin(uv.y * 1100.0);        // scanlines
  cyber *= 0.96 + 0.04 * sin(uTime * 3.0 + uv.y * 40.0); // slow flicker band

  float revealed = step(0.0, d) * step(0.001, uReveal);
  float beam = exp(-abs(d) * 90.0) * step(0.001, uReveal) * step(uReveal, 0.999);

  vec3 outCol = cyber + uAccent * beam * 1.5;
  float alpha = max(revealed, beam);
  gl_FragColor = vec4(outCol, alpha);
  #include <colorspace_fragment>
}
`

export function PortraitPhoto() {
  const texture = useLoader(THREE.TextureLoader, '/alireza.jpg')
  const mesh = useRef<THREE.Mesh>(null!)
  const material = useRef<THREE.ShaderMaterial>(null!)

  const { width, uniforms } = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    const img = texture.image as HTMLImageElement
    return {
      width: (PORTRAIT_HEIGHT * img.width) / img.height,
      uniforms: {
        uTex: { value: texture },
        uReveal: { value: 0 },
        uTime: { value: 0 },
        uTint: { value: new THREE.Color('#dff4ff') },
        uAccent: { value: new THREE.Color('#c6f432') },
      },
    }
  }, [texture])

  useFrame((_, dt) => {
    const u = material.current.uniforms as typeof uniforms
    const framed = sceneStates[store.target].shape === 'portrait' && !!store.portraitAnchor
    const target = framed ? store.portraitHover : 0
    // Constant-speed sweep in, slightly faster sweep out.
    const speed = target > u.uReveal.value ? 0.9 : 1.4
    u.uReveal.value += Math.sign(target - u.uReveal.value) * Math.min(Math.abs(target - u.uReveal.value), dt * speed)
    u.uTime.value += dt
    mesh.current.visible = u.uReveal.value > 0.001
  })

  return (
    <mesh ref={mesh} position={[0, 0, -0.02]} renderOrder={0} visible={false}>
      <planeGeometry args={[width, PORTRAIT_HEIGHT]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}
