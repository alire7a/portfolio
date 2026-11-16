import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from './sceneStore'

const vertex = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uSize;
uniform float uPixelRatio;
attribute float aSeed;
varying float vAlpha;

void main() {
  vec3 p = position;
  // Parallax: nearer particles travel further with scroll; wrap vertically forever.
  float depth = 0.4 + aSeed * 1.4;
  p.y = mod(p.y + uScroll * depth + uTime * 0.04 * depth + 7.0, 14.0) - 7.0;
  p.x += sin(uTime * 0.25 + p.y * 0.6 + aSeed * 12.0) * 0.12;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.35 + aSeed) * uPixelRatio / -mv.z;
  vAlpha = smoothstep(14.0, 4.0, -mv.z) * (0.25 + 0.75 * aSeed);
}
`

const fragment = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d);
  gl_FragColor = vec4(uColor, a * vAlpha * 0.8);
  #include <colorspace_fragment>
}
`

export function Particles({ count = 1400 }: { count?: number }) {
  const dpr = useThree((s) => s.viewport.dpr)
  const material = useRef<THREE.ShaderMaterial>(null!)

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = -Math.random() * 9 + 1
      seed[i] = Math.random()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uSize: { value: 60 },
      uPixelRatio: { value: dpr },
      uColor: { value: new THREE.Color(store.liveRim) },
    }),
    [dpr],
  )

  useFrame((_, dt) => {
    const u = material.current.uniforms as typeof uniforms
    u.uTime.value += dt
    u.uScroll.value = THREE.MathUtils.damp(u.uScroll.value, store.progress * 10, 4, dt)
    u.uColor.value.set(store.liveRim)
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
