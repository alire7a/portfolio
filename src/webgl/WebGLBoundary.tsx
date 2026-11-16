import { Component, type ReactNode } from 'react'

/** If WebGL fails, render the fallback (or nothing) instead of taking the whole page down. */
export class WebGLBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}
