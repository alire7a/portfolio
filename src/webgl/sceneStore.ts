// Bridge between the DOM (scroll, hover) and the WebGL scene.
// Plain mutable object on purpose: read every frame in useFrame, no React re-renders.

import type { ShapeKey } from './shapes'

export type SceneKey = 'hero' | 'about' | 'skills' | 'experience' | 'work' | 'awards' | 'contact'

export type SceneState = {
  /** Which front-end symbol the particles form (see shapes.ts). */
  shape: ShapeKey
  /** Horizontal offset as a fraction of half the viewport width (-1 … 1). */
  x: number
  y: number
  z: number
  scale: number
  /** 0 … 1 fade (keeps text readable when the shape sits behind it). */
  dim: number
  /** Gradient across the shape. */
  colorA: string
  colorB: string
}

export const sceneStates: Record<SceneKey, SceneState> = {
  hero: { shape: 'code', x: 0.5, y: 0.3, z: 0, scale: 0.9, dim: 0, colorA: '#7b5cff', colorB: '#9fe7ff' },
  about: { shape: 'portrait', x: 0.62, y: 0, z: 0, scale: 1, dim: 0, colorA: '#ff5a36', colorB: '#ffd6a0' },
  skills: { shape: 'components', x: 0.66, y: 0.1, z: -0.8, scale: 0.75, dim: 0.3, colorA: '#11b5a4', colorB: '#c6f432' },
  work: { shape: 'browser', x: 0, y: 0, z: -2.2, scale: 1.5, dim: 0.62, colorA: '#4630d8', colorB: '#9fe7ff' },
  experience: { shape: 'branch', x: 0.74, y: 0, z: -0.8, scale: 0.85, dim: 0.35, colorA: '#7fae12', colorB: '#e8ffd0' },
  awards: { shape: 'spark', x: 0.62, y: 0.25, z: -0.8, scale: 0.7, dim: 0.2, colorA: '#e0a43a', colorB: '#fff1c9' },
  contact: { shape: 'mail', x: 0, y: 0.02, z: -1.2, scale: 1.2, dim: 0.55, colorA: '#7a5cff', colorB: '#c6f432' },
}

export const store = {
  /** Flipped by the intro once the loader lifts; particles wait for it. */
  ready: false,
  target: 'hero' as SceneKey,
  /** 0 … 1 page scroll progress. */
  progress: 0,
  /** Scroll velocity, roughly px/ms. */
  velocity: 0,
  /** Normalised pointer, -1 … 1. */
  pointer: { x: 0, y: 0 },
  /** Set while a project row is hovered: [colorA, colorB]. */
  hoverTint: null as [string, string] | null,
  /** Desktop hero box the glyph centres itself in. */
  heroAnchor: null as HTMLElement | null,
  /** The About frame the particle portrait locks onto. */
  portraitAnchor: null as HTMLElement | null,
  /** 0 / 1 while the portrait frame is hovered (particles scatter, photo shows). */
  portraitHover: 0,
  /** Live highlight colour, shared with the background dust. */
  liveRim: '#9fe7ff',
}

if (import.meta.env.DEV) (window as unknown as { __store: typeof store }).__store = store
