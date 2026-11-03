import { useRef } from 'react'
import { MeshReflectorMaterial, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { world } from '@/state/world'
import { ZONE } from '@/config/layout'
import { COLORS } from '@/config/tuning'
import { getMaterials, glassProps } from '../common/materials'
import { Beam, GridFloor, MetalText, PillarField, ShardField } from '../common/primitives'
import { useQuality, useZoneFrame } from '../common/Zone'
import { portalFragment, portalVertex } from '../common/shaders'

const PYLON_X = 9
const OPENING_CENTER_Y = 10

/** [x, z, height] of the translucent emerald crystals flanking the gateway. */
const CRYSTALS: Array<[number, number, number]> = [
  [-16, -2, 14],
  [17, 3, 11],
  [-25, 8, 8],
  [26, -5, 9],
]

/**
 * EXPERIENCE 01 — THE EMERALD GATEWAY
 * Monumental metal pylons and lintel, translucent emerald crystals, counter-rotating ring arcs,
 * a shader-driven portal veil, volumetric-style light shafts and drifting fragments.
 * The intro timeline flies the camera straight through the opening.
 */
export function EmeraldGateway() {
  const q = useQuality()
  const m = getMaterials()
  const glass = glassProps(q.transmission)
  const arcs = useRef<THREE.Group>(null)
  const monogram = useRef<THREE.Group>(null)
  const portal = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useRef({
    uTime: { value: 0 },
    uIntensity: { value: 0.5 },
    uColorA: { value: new THREE.Color(COLORS.accent) },
    uColorB: { value: new THREE.Color(COLORS.mint) },
  })

  useZoneFrame(ZONE.gateway, (time, dt) => {
    arcs.current?.children.forEach((child, i) => {
      child.rotation.z += dt * (0.14 + i * 0.07) * (i % 2 === 0 ? 1 : -1)
    })
    if (monogram.current) monogram.current.position.y = 15.5 + Math.sin(time * 0.6) * 0.35
    if (portal.current) {
      portal.current.uniforms.uTime.value = time
      portal.current.uniforms.uIntensity.value = 0.55 + world.portal * 1.7
    }
  })

  return (
    <group>
      {/* Floor: planar reflections on the cinematic tier, polished dark metal elsewhere. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[58, 72]} />
        {q.reflector ? (
          <MeshReflectorMaterial
            color="#04130d"
            blur={[260, 80]}
            resolution={512}
            mixBlur={1}
            mixStrength={40}
            mirror={0.6}
            roughness={1}
            metalness={0.5}
          />
        ) : (
          <primitive object={m.metalFloor} attach="material" />
        )}
      </mesh>
      <GridFloor position={[0, 0.03, 0]} size={140} cell={3} color={COLORS.accent} opacity={0.2} radius={52} />

      {/* Pylons */}
      {[-PYLON_X, PYLON_X].map((x) => (
        <group key={x}>
          <RoundedBox args={[3.6, 20, 3.6]} radius={0.22} smoothness={3} position={[x, 10, 0]} castShadow receiveShadow>
            <primitive object={m.metalDark} attach="material" />
          </RoundedBox>
          <mesh position={[x - Math.sign(x) * 1.85, 10, 0]}>
            <boxGeometry args={[0.1, 18, 1.2]} />
            <primitive object={m.glowAccent} attach="material" />
          </mesh>
          <mesh position={[x, 19.4, 0]} castShadow>
            <boxGeometry args={[3.95, 0.3, 3.95]} />
            <primitive object={m.gold} attach="material" />
          </mesh>
          <mesh position={[x, 0.45, 0]} castShadow>
            <boxGeometry args={[4.4, 0.9, 4.4]} />
            <primitive object={m.metalSteel} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Lintel */}
      <RoundedBox args={[24.4, 2.6, 4.2]} radius={0.2} smoothness={3} position={[0, 21.3, 0]} castShadow>
        <primitive object={m.metalDark} attach="material" />
      </RoundedBox>
      <mesh position={[0, 19.98, 0]}>
        <boxGeometry args={[14.4, 0.08, 1.4]} />
        <primitive object={m.glowAccent} attach="material" />
      </mesh>
      <mesh position={[0, 21.3, 2.18]}>
        <boxGeometry args={[16, 0.9, 0.3]} />
        <meshPhysicalMaterial {...glass} />
      </mesh>

      {/* Counter-rotating ring arcs, squashed taller to fill the opening */}
      <group position={[0, OPENING_CENTER_Y, 0]} scale={[1, 1.35, 1]}>
        <group ref={arcs}>
          {[0, 1, 2, 3, 4].map((k) => (
            <mesh key={k} position={[0, 0, -k * 3.4]}>
              <torusGeometry args={[6.4 - k * 0.85, 0.16 - k * 0.012, 12, 120, Math.PI * (1.15 + (k % 3) * 0.28)]} />
              <primitive object={k % 2 === 0 ? m.glowAccent : m.glowMint} attach="material" />
            </mesh>
          ))}
        </group>
        <mesh>
          <torusGeometry args={[6.9, 0.06, 8, 160]} />
          <primitive object={m.gold} attach="material" />
        </mesh>
        {/* Portal veil */}
        <mesh position={[0, 0, -0.3]}>
          <circleGeometry args={[7.1, 64]} />
          <shaderMaterial
            ref={portal}
            uniforms={uniforms.current}
            vertexShader={portalVertex}
            fragmentShader={portalFragment}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Monogram */}
      <group ref={monogram} position={[0, 15.5, -1.5]}>
        <MetalText material={m.gold} size={2.4} depth={0.5}>
          MV
        </MetalText>
      </group>

      {/* Translucent emerald glass */}
      {CRYSTALS.map(([x, z, h], i) => (
        <mesh key={i} position={[x, h * 0.5, z]} scale={[1.7, h * 0.5, 1.7]} rotation={[0, i * 0.9, 0]}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial {...glass} flatShading />
        </mesh>
      ))}

      {/* Light shafts */}
      <Beam position={[0, 10.5, -1]} height={21} radius={4.2} intensity={0.3} />
      <Beam position={[-4.6, 10.5, 1]} height={21} radius={2.6} intensity={0.2} color={COLORS.mint} />
      <Beam position={[4.6, 10.5, 1]} height={21} radius={2.6} intensity={0.2} color={COLORS.mint} />

      {/* Floating fragments + monolith silhouettes */}
      <ShardField zone={ZONE.gateway} count={Math.round(70 * q.density)} radius={[14, 42]} height={[2, 30]} size={[0.25, 0.9]} seed={11} castShadow={q.shadows} />
      <ShardField zone={ZONE.gateway} count={Math.round(32 * q.density)} radius={[8, 36]} height={[1, 26]} size={[0.07, 0.2]} seed={12} material={m.glowMint} />
      <PillarField count={Math.round(40 * q.density)} radius={[38, 90]} height={[14, 60]} width={[3, 9]} center={[0, 0, 30]} seed={2} />
    </group>
  )
}
