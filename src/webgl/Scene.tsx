import { useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { Morph } from './Morph'
import { Particles } from './Particles'
import { store } from './sceneStore'
import { WebGLBoundary } from './WebGLBoundary'

/**
 * Render on GSAP's ticker instead of R3F's own rAF. Lenis also runs on this ticker (added
 * earlier), so each frame scroll updates first and the scene renders after — the particle
 * portrait reads its DOM frame's position in the same tick and never lags a frame behind.
 */
function TickerDriver() {
  const advance = useThree((s) => s.advance)
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    // R3F's advance() takes a timestamp in *seconds* (same unit as its clock) — GSAP's ticker time.
    const tick = (time: number) => advance(time)
    let added = false
    let alive = true
    // Compile the shaders in parallel (KHR_parallel_shader_compile) before the first frame, so the
    // first render doesn't block the main thread. The particles are invisible under the loader
    // until well after this resolves, so nothing on screen changes.
    gl.compileAsync(scene, camera)
      .catch(() => {})
      .then(() => {
        if (!alive) return
        gsap.ticker.add(tick)
        added = true
      })
    return () => {
      alive = false
      if (added) gsap.ticker.remove(tick)
    }
  }, [advance, gl, scene, camera])
  return null
}

export default function Scene() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      store.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const narrow = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <WebGLBoundary>
      <Canvas
        className={`scene ${ready ? 'is-ready' : ''}`}
        dpr={[1, 1.75]}
        frameloop="never"
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={(s) => {
          if (import.meta.env.DEV) (window as unknown as { __r3f: unknown }).__r3f = s
          requestAnimationFrame(() => setReady(true))
        }}
        aria-hidden
      >
        <TickerDriver />
        <Morph count={narrow ? 10000 : 16000} />
        <Particles count={narrow ? 300 : 700} />
      </Canvas>
    </WebGLBoundary>
  )
}
