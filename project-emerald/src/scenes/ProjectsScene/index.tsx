import type { ReactElement } from 'react'
import { ZONE, ZONE_ORIGIN, projectPosition } from '@/config/layout'
import { PROJECTS } from '@/data/projects'
import { canHover, isBackgroundTarget, setCursor3D } from '@/lib/dom'
import { hoverProject, selectProject } from '@/state/actions'
import { getMaterials } from '../common/materials'
import { GridFloor, PillarField, ShardField } from '../common/primitives'
import { SceneBoundary, useQuality, useZoneFrame } from '../common/Zone'
import { updateProjectBoost } from './boost'
import { AetherEnv } from './environments/AetherEnv'
import { CosmosEnv } from './environments/CosmosEnv'
import { FinanceEnv } from './environments/FinanceEnv'
import { PortfolioEnv } from './environments/PortfolioEnv'
import { SecurityEnv } from './environments/SecurityEnv'

const ENVIRONMENTS: Record<(typeof PROJECTS)[number]['id'], (props: { index: number }) => ReactElement> = {
  aether: (p) => <AetherEnv {...p} />,
  cosmos: (p) => <CosmosEnv {...p} />,
  'password-lab': (p) => <SecurityEnv {...p} />,
  finance: (p) => <FinanceEnv {...p} />,
  portfolio: (p) => <PortfolioEnv {...p} />,
}

/**
 * EXPERIENCE 02 — PROJECT UNIVERSE
 * Five distinct environments arranged on a ring. Each is authored facing +Z and yawed outward, so
 * the camera (which stands outside the ring looking in) always meets it head-on. Selecting a project
 * flies the camera along the ring; hovering or visiting an environment wakes it up.
 */
export function ProjectsScene() {
  const q = useQuality()
  const m = getMaterials()
  const n = PROJECTS.length

  useZoneFrame(ZONE.projects, (_t, _dt, _s, raw) => updateProjectBoost(raw))

  return (
    <group position={ZONE_ORIGIN.projects}>
      {PROJECTS.map((project, i) => {
        const [x, , z] = projectPosition(i, n)
        const Env = ENVIRONMENTS[project.id]
        return (
          <group key={project.id} position={[x, 0, z]} rotation={[0, (i / n) * Math.PI * 2, 0]}>
            <SceneBoundary name={`project:${project.id}`}>
              <Env index={i} />
            </SceneBoundary>
            {/* Invisible hit volume: hover wakes the environment, click selects it. */}
            <mesh
              position={[0, 6, 0]}
              onPointerOver={(e) => {
                if (!canHover()) return
                e.stopPropagation()
                hoverProject(i)
                setCursor3D(true)
              }}
              onPointerOut={() => {
                hoverProject(-1)
                setCursor3D(false)
              }}
              onClick={(e) => {
                if (!isBackgroundTarget(e.nativeEvent)) return
                e.stopPropagation()
                selectProject(i)
              }}
            >
              <sphereGeometry args={[9.5, 16, 12]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        )
      })}

      {/* Shared universe backdrop */}
      <GridFloor position={[0, -14, 0]} size={420} cell={6} opacity={0.14} radius={170} />
      <mesh position={[0, -13.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[74.6, 75.4, 192]} />
        <primitive object={m.glowMint} attach="material" />
      </mesh>
      <ShardField zone={ZONE.projects} count={Math.round(110 * q.density)} radius={[30, 120]} height={[-8, 40]} size={[0.2, 0.9]} seed={111} />
      <PillarField count={Math.round(36 * q.density)} radius={[140, 230]} height={[20, 70]} width={[4, 12]} floorY={-14} seed={19} corridor={0} />
    </group>
  )
}
