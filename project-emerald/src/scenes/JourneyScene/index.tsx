import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { world } from '@/state/world'
import { JOURNEY_GATE_RADIUS, JOURNEY_GATE_SPACING, ZONE, ZONE_ORIGIN } from '@/config/layout'
import { JOURNEY } from '@/data/journey'
import { damp } from '@/lib/math'
import { getMaterials } from '../common/materials'
import { GridFloor, MetalText, PillarField, ShardField } from '../common/primitives'
import { useQuality, useZoneFrame } from '../common/Zone'

const GATE_Y = 2.5

function Gate({ index }: { index: number }) {
  const m = getMaterials()
  const ring = useMemo(() => m.glowAccent.clone(), [m])
  useEffect(() => () => ring.dispose(), [ring])
  const arc = useRef<THREE.Mesh>(null)
  const label = useRef<THREE.Group>(null)

  useZoneFrame(ZONE.journey, (_time, dt, _state, raw) => {
    const active = Math.round(world.journey * (JOURNEY.length - 1)) === index ? 1 : 0
    ring.emissiveIntensity = damp(ring.emissiveIntensity, 0.6 + active * 3, 4, raw)
    if (arc.current) arc.current.rotation.z += dt * (0.3 + index * 0.05) * (index % 2 === 0 ? 1 : -1)
    if (label.current) label.current.scale.setScalar(damp(label.current.scale.x, 0.8 + active * 0.25, 5, raw))
  })

  return (
    <group position={[0, GATE_Y, -index * JOURNEY_GATE_SPACING]}>
      <mesh>
        <torusGeometry args={[JOURNEY_GATE_RADIUS, 0.14, 12, 120]} />
        <primitive object={ring} attach="material" />
      </mesh>
      <mesh>
        <torusGeometry args={[JOURNEY_GATE_RADIUS + 1.3, 0.05, 8, 140]} />
        <primitive object={m.metalSteel} attach="material" />
      </mesh>
      <mesh ref={arc}>
        <torusGeometry args={[JOURNEY_GATE_RADIUS - 1, 0.1, 10, 100, Math.PI * 1.3]} />
        <primitive object={m.gold} attach="material" />
      </mesh>
      <group ref={label} position={[0, JOURNEY_GATE_RADIUS + 3.2, 0]}>
        <MetalText material={m.metalSteel} size={2.2} depth={0.4}>
          {JOURNEY[index].index}
        </MetalText>
      </group>
    </group>
  )
}

/**
 * Development journey: a tunnel of ring-gates, one per stage. Scroll flies the camera through
 * them, lingering at each gate while its stage is described in the interface.
 */
export function JourneyScene() {
  const q = useQuality()
  const m = getMaterials()
  const midZ = -((JOURNEY.length - 1) * JOURNEY_GATE_SPACING) / 2
  const span = (JOURNEY.length - 1) * JOURNEY_GATE_SPACING + 80

  const floorMid = useMemo<[number, number, number]>(() => [0, -2.2, midZ], [midZ])

  return (
    <group position={ZONE_ORIGIN.journey}>
      {JOURNEY.map((_, i) => (
        <Gate key={i} index={i} />
      ))}
      <GridFloor position={floorMid} size={span * 1.2} cell={3} opacity={0.26} radius={span * 0.6} />
      <ShardField
        zone={ZONE.journey}
        count={Math.round(90 * q.density)}
        shape="box"
        mode="stream"
        stretch={[0.03, 0.03, 3.5]}
        center={[0, 0, midZ]}
        radius={[3, 20]}
        height={[-4, 11]}
        size={[0.6, 1.2]}
        length={span}
        speed={1}
        seed={121}
        material={m.glowMint}
      />
      <ShardField zone={ZONE.journey} count={Math.round(50 * q.density)} radius={[12, 40]} height={[-3, 18]} size={[0.15, 0.6]} center={[0, 0, midZ]} seed={122} />
      <PillarField count={Math.round(40 * q.density)} radius={[24, 80]} height={[14, 56]} width={[2.5, 8]} floorY={-2.2} center={[0, 0, midZ]} seed={23} />
    </group>
  )
}
