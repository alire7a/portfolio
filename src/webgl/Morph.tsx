import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { morphFragment, morphVertex } from './shaders/morph'
import { whenIdle } from '../lib/idle'
import { ensureShape, PORTRAIT_HEIGHT, type ShapeKey, type ShapeSet } from './shapes'
import { streamShapes } from './shapeStream'
import { sceneStates, store } from './sceneStore'
import { PortraitPhoto } from './PortraitPhoto'

const damp = THREE.MathUtils.damp
const tmp = new THREE.Color()
const MORPH_SECONDS = 1.8
// Scratch objects for re-basing particles when the portrait locks onto its frame.
const oldMatrix = new THREE.Matrix4()
const rebase = new THREE.Matrix4()
const tmpV = new THREE.Vector3()

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
/** Must match the stagger in the vertex shader. */
const localProgress = (p: number, seed: number) =>
  easeInOutCubic(Math.min(1, Math.max(0, p * 1.5 - seed * 0.5)))

export function Morph({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null!)
  const material = useRef<THREE.ShaderMaterial>(null!)
  const viewport = useThree((s) => s.viewport)
  const screenHeight = useThree((s) => s.size.height)
  const isMobile = viewport.aspect < 0.85

  // Filled as the shapes worker streams them in (hero glyph first, portrait last).
  const shapes = useMemo<ShapeSet>(() => ({}), [count])

  // The source photo (About hover reveal) isn't needed at start-up: fetch it once the page is idle.
  const [photo, setPhoto] = useState(false)
  useEffect(() => void whenIdle(() => setPhoto(true), 4000), [])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) seeds[i] = Math.random()
    // Positions arrive from the worker; the intro waits for the glyph before it starts.
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    g.setAttribute('aFrom', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    g.setAttribute('aTo', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    // Per-particle colour, only used by the portrait (filled once the photo loads).
    g.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    return g
  }, [count])

  useEffect(
    () =>
      streamShapes(count, '/alireza-cutout.png', (msg) => {
        if (msg.failed) return // no portrait → About falls back to the particle halo
        shapes[msg.key] = msg.positions
        if (msg.key === 'code') {
          for (const name of ['position', 'aTo'] as const) {
            ;(geometry.attributes[name].array as Float32Array).set(msg.positions)
            geometry.attributes[name].needsUpdate = true
          }
        } else if (msg.key === 'portrait' && msg.colors) {
          ;(geometry.attributes.aColor.array as Float32Array).set(msg.colors)
          geometry.attributes.aColor.needsUpdate = true
        }
      }),
    [shapes, geometry, count],
  )

  const uniforms = useMemo(() => {
    const s = sceneStates.hero
    return {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uTurb: { value: 0 },
      uSize: { value: 22 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
      uOpacity: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uColorA: { value: new THREE.Color(s.colorA) },
      uColorB: { value: new THREE.Color(s.colorB) },
      uPhoto: { value: 0 },
      uReveal: { value: 0 },
    }
  }, [])

  // First load: particles fly in from a scattered cloud into `</>`.
  const morph = useRef({ shape: 'code' as ShapeKey, progress: 0, introDone: false })
  const vp = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20)
    const s = sceneStates[store.target]
    const u = material.current.uniforms as typeof uniforms
    const m = morph.current
    const vel = Math.min(Math.abs(store.velocity), 4) || 0

    if (!m.introDone) {
      // Scatter the starting positions once so the intro is a "build".
      const from = geometry.attributes.aFrom.array as Float32Array
      for (let i = 0; i < from.length; i++) from[i] = (Math.random() - 0.5) * 6
      geometry.attributes.aFrom.needsUpdate = true
      m.introDone = true
    }
    // Hold the scattered cloud (invisible) until the loader lifts and the glyph has been sampled.
    if (!store.ready || !shapes.code) return

    const want: ShapeKey = s.shape === 'portrait' && !shapes.portrait ? 'halo' : s.shape
    const isPortrait = want === 'portrait'
    // The portrait locks onto its DOM frame in the About section.
    const anchor = isPortrait ? store.portraitAnchor : null
    const g = group.current
    const time = state.clock.elapsedTime

    // ── Placement target ──
    let tx: number, ty: number, tz: number, ts: number
    if (anchor) {
      // Map the frame's screen rect into world space every frame, so the particles stay
      // registered with the frame while it scrolls / sticks.
      const r = anchor.getBoundingClientRect()
      tz = 0
      const view = state.viewport.getCurrentViewport(state.camera, vp.set(0, 0, tz))
      tx = ((r.left + r.width / 2) / state.size.width - 0.5) * view.width
      ty = -((r.top + r.height / 2) / state.size.height - 0.5) * view.height
      ts = ((r.height / state.size.height) * view.height) / PORTRAIT_HEIGHT
    } else if (!isMobile && store.target === 'hero' && store.heroAnchor) {
      // Desktop hero: centre the glyph in its DOM box and fit it to the box width.
      const r = store.heroAnchor.getBoundingClientRect()
      tx = ((r.left + r.width / 2) / state.size.width - 0.5) * viewport.width
      ty = -((r.top + r.height / 2) / state.size.height - 0.5) * viewport.height
      tz = s.z
      const boxWidth = (r.width / state.size.width) * viewport.width
      ts = Math.min(s.scale * Math.min(1, viewport.width / 6), boxWidth / 2.4) // glyph ≈ 2.4 world units wide
    } else {
      // Glyph placement (x/y are fractions of half the viewport).
      tx = isMobile ? 0 : s.x * (viewport.width / 2)
      // Portrait screens: hero text sits low (above the name), so the shape takes the free band up top.
      const heroBand = isMobile && store.target === 'hero'
      const phone = viewport.aspect < 0.6 // tall phones have a shorter free band than tablets
      ty = isMobile ? (heroBand ? viewport.height * (phone ? 0.315 : 0.27) : 0) : s.y * (viewport.height / 2)
      tz = s.z
      const fit = isMobile ? (viewport.width / 2.8) * (heroBand ? (phone ? 0.6 : 0.72) : 1) : Math.min(1, viewport.width / 6)
      ts = s.scale * fit
    }

    // ── Retarget: freeze the current (eased) positions as the new start, then morph to the new shape ──
    if (want !== m.shape) {
      const from = geometry.attributes.aFrom.array as Float32Array
      const to = geometry.attributes.aTo.array as Float32Array
      const seeds = geometry.attributes.aSeed.array as Float32Array
      for (let i = 0; i < count; i++) {
        const t = localProgress(m.progress, seeds[i])
        const o = i * 3
        from[o] += (to[o] - from[o]) * t
        from[o + 1] += (to[o + 1] - from[o + 1]) * t
        from[o + 2] += (to[o + 2] - from[o + 2]) * t
      }

      if (anchor) {
        // Entering the frame: lock the group onto it *now* instead of easing there, and re-express
        // every particle's current position in the new frame-locked space. Particles fly from
        // exactly where they are on screen into the frame, with no correction move afterwards.
        g.updateMatrix()
        oldMatrix.copy(g.matrix)
        g.position.set(tx, ty, tz)
        g.scale.setScalar(ts)
        g.rotation.set(0, 0, 0)
        g.updateMatrix()
        rebase.copy(g.matrix).invert().multiply(oldMatrix)
        for (let i = 0; i < count; i++) {
          const o = i * 3
          tmpV.set(from[o], from[o + 1], from[o + 2]).applyMatrix4(rebase)
          from[o] = tmpV.x
          from[o + 1] = tmpV.y
          from[o + 2] = tmpV.z
        }
      }

      to.set(ensureShape(shapes, want, count) ?? shapes.code)
      geometry.attributes.aFrom.needsUpdate = true
      geometry.attributes.aTo.needsUpdate = true
      m.shape = want
      m.progress = 0
    }
    m.progress = Math.min(1, m.progress + dt / MORPH_SECONDS)

    u.uTime.value += dt
    u.uProgress.value = m.progress
    u.uTurb.value = damp(u.uTurb.value, vel, 4, dt)
    u.uPhoto.value = damp(u.uPhoto.value, isPortrait ? 1 : 0, 2.2, dt)
    // Hovering the frame shows the source photo under the particles; soften them a touch.
    u.uReveal.value = damp(u.uReveal.value, isPortrait ? store.portraitHover : 0, 3, dt)

    // Short phones (e.g. iPhone SE) have no free band above the hero text: fade the shape back.
    const heroDim = screenHeight < 720 ? 0.85 : 0
    const dim = anchor ? 0 : isMobile ? (store.target === 'hero' ? heroDim : Math.max(s.dim, 0.7)) : s.dim
    u.uOpacity.value = damp(u.uOpacity.value, 1 - dim * 0.85, 2, dt)

    const k = 1 - Math.exp(-2.4 * dt)
    const [a, b] = store.hoverTint ?? [s.colorA, s.colorB]
    u.uColorA.value.lerp(tmp.set(a), store.hoverTint ? k * 1.8 : k)
    u.uColorB.value.lerp(tmp.set(b), store.hoverTint ? k * 1.8 : k)
    store.liveRim = '#' + u.uColorB.value.getHexString()

    // ── Apply placement ──
    if (anchor) {
      // Hard-locked to the frame (no easing, no rotation): stays registered with the photo.
      g.position.set(tx, ty, tz)
      g.scale.setScalar(ts)
      g.rotation.set(0, 0, 0)
    } else {
      g.position.x = damp(g.position.x, tx, 2, dt)
      g.position.y = damp(g.position.y, ty, 2, dt)
      g.position.z = damp(g.position.z, tz, 2, dt)
      g.scale.setScalar(damp(g.scale.x, ts, 2, dt))
      // Tilt toward the pointer + slow sway so the depth reads.
      g.rotation.y = damp(g.rotation.y, store.pointer.x * 0.45 + Math.sin(time * 0.35) * 0.18, 3, dt)
      g.rotation.x = damp(g.rotation.x, store.pointer.y * 0.25, 3, dt)
    }

    // Pointer in the group's local space (rotation ignored — close enough for a soft push).
    const view = state.viewport.getCurrentViewport(state.camera, g.position)
    const wx = store.pointer.x * (view.width / 2)
    const wy = -store.pointer.y * (view.height / 2)
    const lx = (wx - g.position.x) / g.scale.x
    const ly = (wy - g.position.y) / g.scale.x
    u.uMouse.value.set(anchor ? 99 : lx, anchor ? 99 : ly, 0) // no push on the framed portrait
  })

  return (
    <group ref={group} position={[viewport.width * 0.22, 0, 0]}>
      {photo && (
        <Suspense fallback={null}>
          <PortraitPhoto />
        </Suspense>
      )}
      <points geometry={geometry} frustumCulled={false} renderOrder={1}>
        <shaderMaterial
          ref={material}
          vertexShader={morphVertex}
          fragmentShader={morphFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
