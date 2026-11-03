import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ZONE } from '@/config/layout'
import { COLORS } from '@/config/tuning'
import { mulberry32 } from '@/lib/math'
import { getMaterials } from '../../common/materials'
import { ShardField } from '../../common/primitives'
import { atmosphereFragment, atmosphereVertex, starFragment, starVertex } from '../../common/shaders'
import { useQuality, useZoneFrame } from '../../common/Zone'
import { projectBoost } from '../boost'

interface PlanetSpec {
  radius: number
  size: number
  speed: number
  color: string
  atmosphere: string
  rings?: boolean
}

const PLANETS: PlanetSpec[] = [
  { radius: 6, size: 0.8, speed: 0.35, color: '#2e8f6f', atmosphere: '#8AFFC1' },
  { radius: 9.5, size: 1.3, speed: 0.22, color: '#b9a779', atmosphere: '#C8B88A', rings: true },
  { radius: 13, size: 0.62, speed: 0.14, color: '#1c6f55', atmosphere: '#00DFA0' },
]

/**
 * COSMOS — a deep-space system: a churning star, three planets with atmospheres and a ringed gas
 * giant on tilted orbits, an asteroid belt and a surrounding star field. Warm gold against cold mint
 * keeps it visually distinct from the emerald architecture of AETHER.
 */
export function CosmosEnv({ index }: { index: number }) {
  const q = useQuality()
  const m = getMaterials()
  const root = useRef<THREE.Group>(null)
  const system = useRef<THREE.Group>(null)

  const starUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#C8B88A') },
      uColorB: { value: new THREE.Color('#fff3d1') },
    }),
    [],
  )
  const glowUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color('#C8B88A') }, uPower: { value: 2.2 }, uIntensity: { value: 1.3 } }),
    [],
  )
  const atmosphereUniforms = useMemo(
    () => PLANETS.map((p) => ({ uColor: { value: new THREE.Color(p.atmosphere) }, uPower: { value: 2.6 }, uIntensity: { value: 1.1 } })),
    [],
  )

  const starfield = useMemo(() => {
    const count = Math.round(520 * q.density) + 80
    const rand = mulberry32(99)
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 34 + rand() * 30
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(2 * rand() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = 8 + r * Math.cos(phi) * 0.7
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [q.density])
  useEffect(() => () => starfield.dispose(), [starfield])

  useZoneFrame(ZONE.projects, (time) => {
    const b = projectBoost[index]
    starUniforms.uTime.value = time
    system.current?.children.forEach((pivot, i) => {
      const spec = PLANETS[i]
      if (spec) pivot.rotation.y = time * spec.speed * (1 + b * 1.6) + i * 2.1
    })
    root.current?.scale.setScalar(1 + b * 0.04)
  })

  return (
    <group ref={root} position={[0, 7, 0]}>
      {/* Star */}
      <mesh>
        <sphereGeometry args={[2.1, 48, 32]} />
        <shaderMaterial uniforms={starUniforms} vertexShader={starVertex} fragmentShader={starFragment} />
      </mesh>
      <mesh scale={1.45}>
        <sphereGeometry args={[2.1, 32, 24]} />
        <shaderMaterial
          uniforms={glowUniforms}
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Planets on tilted orbital plane */}
      <group rotation={[0.18, 0, 0.1]}>
        <group ref={system}>
          {PLANETS.map((p, i) => (
            <group key={i}>
              <group position={[p.radius, 0, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[p.size, 40, 28]} />
                  <meshStandardMaterial color={p.color} roughness={0.65} metalness={0.15} emissive={p.color} emissiveIntensity={0.12} />
                </mesh>
                <mesh scale={1.14}>
                  <sphereGeometry args={[p.size, 32, 24]} />
                  <shaderMaterial
                    uniforms={atmosphereUniforms[i]}
                    vertexShader={atmosphereVertex}
                    fragmentShader={atmosphereFragment}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                  />
                </mesh>
                {p.rings && (
                  <mesh rotation={[-Math.PI / 2 + 0.45, 0, 0.2]}>
                    <ringGeometry args={[p.size * 1.55, p.size * 2.5, 96]} />
                    <meshBasicMaterial color={COLORS.gold} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
                  </mesh>
                )}
              </group>
            </group>
          ))}
        </group>
        {/* Orbit paths */}
        {PLANETS.map((p, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[p.radius - 0.015, p.radius + 0.015, 160]} />
            <meshBasicMaterial color={COLORS.mint} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
        <ShardField zone={ZONE.projects} count={Math.round(220 * q.density)} radius={[15.5, 18.5]} height={[-0.7, 0.7]} size={[0.05, 0.17]} seed={71} color="#7d7358" emissive="#000000" />
      </group>

      <points geometry={starfield}>
        <pointsMaterial color={COLORS.mint} size={0.18} sizeAttenuation transparent opacity={0.85} depthWrite={false} fog={false} />
      </points>

      <mesh position={[0, -7.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9, 9.05, 128]} />
        <primitive object={m.glowGold} attach="material" />
      </mesh>
    </group>
  )
}
