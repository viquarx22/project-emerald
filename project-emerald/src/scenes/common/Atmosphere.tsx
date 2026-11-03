import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { world } from '@/state/world'
import { COLORS, TUNING } from '@/config/tuning'
import { useQuality } from './Zone'

const _dir = new THREE.Vector3()
const _aim = new THREE.Vector3()

/** Scene background, fog, procedural image-based lighting and the lights that travel with the camera. */
export function Atmosphere() {
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    scene.background = new THREE.Color(TUNING.background)
    scene.fog = new THREE.FogExp2(TUNING.fog.color, TUNING.fog.density)
    return () => {
      scene.fog = null
    }
  }, [scene])

  return (
    <>
      {/* Procedural studio: no HDR download, so it works offline and loads instantly. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.6} color={COLORS.mint} position={[0, 6, -8]} scale={[16, 3, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[-9, 3, 4]} rotation={[0, Math.PI / 2, 0]} scale={[10, 4, 1]} />
        <Lightformer form="ring" intensity={2.2} color={COLORS.accent} position={[0, 3, 9]} scale={6} />
        <Lightformer form="rect" intensity={1.5} color={COLORS.gold} position={[9, 2, -3]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#7fd8b6" position={[0, -3, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[20, 20, 1]} />
      </Environment>
      <Lights />
    </>
  )
}

function Lights() {
  const q = useQuality()
  const scene = useThree((s) => s.scene)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const key = useRef<THREE.DirectionalLight>(null)
  const emerald = useRef<THREE.PointLight>(null)
  const gold = useRef<THREE.PointLight>(null)

  useEffect(() => {
    const light = key.current
    if (!light) return
    light.shadow.mapSize.set(q.shadowMap, q.shadowMap)
    light.shadow.camera.left = -28
    light.shadow.camera.right = 28
    light.shadow.camera.top = 28
    light.shadow.camera.bottom = -28
    light.shadow.camera.near = 1
    light.shadow.camera.far = 120
    light.shadow.bias = -0.0004
    light.shadow.normalBias = 0.04
    light.shadow.camera.updateProjectionMatrix()
    light.shadow.map?.dispose()
    light.shadow.map = null
  }, [q.shadowMap, q.shadows])

  useFrame(({ camera }) => {
    const a = world.ambience
    if (hemi.current) hemi.current.intensity = TUNING.lights.hemisphere * (0.12 + 0.88 * a)
    scene.environmentIntensity = TUNING.environment * (0.16 + 0.84 * a)

    camera.getWorldDirection(_dir)
    _aim.copy(camera.position).addScaledVector(_dir, 26)

    const light = key.current
    if (light) {
      light.intensity = TUNING.lights.key * (0.1 + 0.9 * a)
      light.target.position.copy(_aim)
      light.target.updateMatrixWorld()
      light.position.set(_aim.x - 16, _aim.y + 34, _aim.z + 18)
    }
    if (emerald.current) {
      emerald.current.intensity = TUNING.lights.emerald * a
      emerald.current.position.copy(camera.position).addScaledVector(_dir, 10).add(_aim.set(0, 3, 0))
    }
    if (gold.current) {
      gold.current.intensity = TUNING.lights.gold * a
      gold.current.position.copy(camera.position).addScaledVector(_dir, 7).add(_aim.set(-6, -1, 0))
    }
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#2a8f6c', '#02100b', 0.5]} />
      <directionalLight ref={key} color="#cffff0" castShadow={q.shadows} />
      <pointLight ref={emerald} color={COLORS.accent} distance={80} decay={2} />
      <pointLight ref={gold} color={COLORS.gold} distance={60} decay={2} />
    </>
  )
}
