import { Suspense, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useUI } from '@/state/ui'
import { world } from '@/state/world'
import { PROFILES } from '@/config/quality'
import { ZONE } from '@/config/layout'
import { Atmosphere } from './common/Atmosphere'
import { CameraRig } from './common/CameraRig'
import { DustField } from './common/DustField'
import { PostFX } from './common/PostFX'
import { disposeMaterials } from './common/materials'
import { SceneBoundary, Zone } from './common/Zone'
import { EmeraldGateway } from './EmeraldGateway'
import { HeroScene } from './HeroScene'
import { AboutScene } from './AboutScene'
import { EducationScene } from './EducationScene'
import { SkillsScene } from './SkillsScene'
import { ProjectsScene } from './ProjectsScene'
import { JourneyScene } from './JourneyScene'
import { ContactScene } from './ContactScene'

/**
 * Runs once everything has mounted: forces every zone visible, pre-compiles every shader program
 * (so the first fly-through never hitches), then tells the interface the world is ready.
 */
function SceneReady() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    let cancelled = false
    try {
      world.visibleZones.fill(true)
      gl.compile(scene, camera)
    } catch (error) {
      console.warn('[emerald] shader pre-compilation skipped', error)
    }
    const id = window.requestAnimationFrame(() => {
      if (!cancelled) useUI.getState().set({ sceneReady: true })
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(id)
    }
  }, [gl, scene, camera])

  return null
}

/**
 * Adaptive quality: if the frame rate collapses, step down one tier (Cinematic -> Balanced -> Lite).
 * It is only armed once the visitor is in the world, so shader compilation during the intro
 * can never cause a false downgrade.
 */
function PerfGuard() {
  const phase = useUI((s) => s.phase)
  if (phase !== 'world') return null
  return <PerformanceMonitor onDecline={() => useUI.getState().degrade()} flipflops={3} />
}

function WorldContent() {
  return (
    <>
      <Atmosphere />
      <CameraRig />
      <DustField />
      <Zone index={ZONE.gateway} name="gateway">
        <EmeraldGateway />
      </Zone>
      <Zone index={ZONE.hero} name="hero">
        <HeroScene />
      </Zone>
      <Zone index={ZONE.about} name="about">
        <AboutScene />
      </Zone>
      <Zone index={ZONE.education} name="education">
        <EducationScene />
      </Zone>
      <Zone index={ZONE.skills} name="skills">
        <SkillsScene />
      </Zone>
      <Zone index={ZONE.projects} name="projects">
        <ProjectsScene />
      </Zone>
      <Zone index={ZONE.journey} name="journey">
        <JourneyScene />
      </Zone>
      <Zone index={ZONE.contact} name="contact">
        <ContactScene />
      </Zone>
      <PostFX />
      <PerfGuard />
      <SceneReady />
    </>
  )
}

/** The persistent, fixed full-viewport 3D world. A single WebGL context serves the whole page. */
export default function World() {
  const tier = useUI((s) => s.tier)
  const q = PROFILES[tier]
  const [visible, setVisible] = useState(() => !document.hidden)
  // Antialiasing is fixed at context creation: the Lite tier has no post-processing, so it needs native MSAA.
  const [nativeAA] = useState(() => tier === 'low')

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      disposeMaterials()
    }
  }, [])

  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas
        dpr={q.dpr}
        shadows={q.shadows}
        frameloop={visible ? 'always' : 'never'}
        camera={{ fov: 38, near: 0.1, far: 520, position: [0, 4.6, 54] }}
        gl={{ antialias: nativeAA, powerPreference: 'high-performance', stencil: false }}
        eventSource={document.getElementById('root') ?? undefined}
        eventPrefix="client"
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            useUI.getState().set({ webgl: false })
          })
        }}
      >
        <SceneBoundary name="world" onError={() => useUI.getState().set({ webgl: false })}>
          <Suspense fallback={null}>
            <WorldContent />
          </Suspense>
        </SceneBoundary>
      </Canvas>
    </div>
  )
}
