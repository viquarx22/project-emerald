import * as THREE from 'three'
import { world } from '@/state/world'
import {
  EDU_PLATFORMS,
  JOURNEY_GATE_SPACING,
  ZONE_ORIGIN,
  projectOutward,
  projectPosition,
  skillNodePosition,
  type Vec3,
} from '@/config/layout'
import { TUNING } from '@/config/tuning'
import { PROJECTS } from '@/data/projects'
import { JOURNEY } from '@/data/journey'
import { clamp, easeInOutCubic, lerp, mod, smoothstep } from '@/lib/math'

export interface Pose {
  pos: THREE.Vector3
  look: THREE.Vector3
}

export const makePose = (): Pose => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() })

type PoseFn = (out: Pose) => void

const UP = new THREE.Vector3(0, 1, 0)
const _f = new THREE.Vector3()
const _r = new THREE.Vector3()
const _c = new THREE.Vector3()
const _pa = makePose()
const _pb = makePose()

/** Pick a value by layout: wide screens vs. portrait phones. */
const S = (desktop: number, portrait: number) => (world.portrait ? portrait : desktop)
const fovNow = () => (world.portrait ? TUNING.rig.fovPortrait : TUNING.rig.fovDesktop)

/**
 * Aim the camera at `center` from `pos`, then slide the aim point sideways / vertically so the
 * subject lands off-centre on screen. `shiftRight` / `shiftUp` are fractions of the half-view:
 * 0.3 pushes the subject 30% of the way towards the right edge, leaving room for DOM text.
 */
function frame(out: Pose, pos: Vec3, center: Vec3, shiftRight: number, shiftUp: number) {
  out.pos.set(pos[0], pos[1], pos[2])
  _c.set(center[0], center[1], center[2])
  _f.subVectors(_c, out.pos)
  const dist = Math.max(_f.length(), 0.001)
  _f.divideScalar(dist)
  _r.crossVectors(_f, UP).normalize()
  const halfH = Math.tan(THREE.MathUtils.degToRad(fovNow() / 2)) * dist
  const halfW = halfH * world.aspect
  out.look.copy(_c).addScaledVector(_r, -shiftRight * halfW).addScaledVector(UP, -shiftUp * halfH)
}

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]

/* ----------------------------------- Zone poses ----------------------------------- */

const gatewayPose: PoseFn = (out) => {
  const k = world.portrait ? 1.3 : 1
  out.pos.set(0, S(4.6, 7), lerp(54, 44, world.dolly) * k)
  out.look.set(0, 10, 0)
}

const heroPose: PoseFn = (out) => {
  const c = ZONE_ORIGIN.hero
  frame(out, [c[0], c[1] + S(1.8, 5), c[2] + S(19, 34)], [c[0], c[1] + 1, c[2]], S(0.32, 0), S(0, 0.34))
}

const aboutPose: PoseFn = (out) => {
  const c = ZONE_ORIGIN.about
  frame(out, [c[0], c[1] + 3, c[2] + S(24, 40)], [c[0], c[1], c[2]], S(0.3, 0), S(0, 0.34))
}

function educationPoseAt(out: Pose, platformIndex: number) {
  const base = add(ZONE_ORIGIN.education, EDU_PLATFORMS[platformIndex])
  frame(
    out,
    add(base, [S(5, 0), S(5.5, 8), S(21, 36)]),
    add(base, [0, 2.6, 0]),
    S(0.28, 0),
    S(0, 0.3),
  )
}

const educationPose: PoseFn = (out) => {
  const n = EDU_PLATFORMS.length
  const s = clamp(world.edu, 0, 1) * (n - 1)
  const i = Math.min(Math.floor(s), n - 2)
  const f = easeInOutCubic(s - i)
  educationPoseAt(_pa, i)
  educationPoseAt(_pb, i + 1)
  out.pos.lerpVectors(_pa.pos, _pb.pos, f)
  out.look.lerpVectors(_pa.look, _pb.look, f)
}

const skillsPose: PoseFn = (out) => {
  const c = ZONE_ORIGIN.skills
  const z = world.skill.zoom
  const sk = world.skill
  const overviewPos: Vec3 = [c[0], c[1] + 5, c[2] + S(27, 46)]
  const overviewLook: Vec3 = [c[0], c[1], c[2]]
  const focusPos: Vec3 = [c[0] + sk.x * 0.5, c[1] + sk.y * 0.5 + 2.5, c[2] + sk.z * 0.5 + S(16, 27)]
  const focusLook: Vec3 = [c[0] + sk.x, c[1] + sk.y, c[2] + sk.z]
  frame(
    out,
    [lerp(overviewPos[0], focusPos[0], z), lerp(overviewPos[1], focusPos[1], z), lerp(overviewPos[2], focusPos[2], z)],
    [lerp(overviewLook[0], focusLook[0], z), lerp(overviewLook[1], focusLook[1], z), lerp(overviewLook[2], focusLook[2], z)],
    S(0.3, 0),
    S(0, 0.28),
  )
}

function projectPoseAt(out: Pose, index: number) {
  const n = PROJECTS.length
  const i = mod(index, n)
  const c = ZONE_ORIGIN.projects
  const p = projectPosition(i, n)
  const [ox, oz] = projectOutward(i, n)
  const dist = S(31, 46)
  frame(
    out,
    [c[0] + p[0] + ox * dist, c[1] + 3.5, c[2] + p[2] + oz * dist],
    [c[0] + p[0], c[1] + 1.5, c[2] + p[2]],
    S(0.3, 0),
    S(0, 0.3),
  )
}

const projectsPose: PoseFn = (out) => {
  const f = world.projectFocus
  const i0 = Math.floor(f)
  const fr = f - i0
  projectPoseAt(_pa, i0)
  projectPoseAt(_pb, i0 + 1)
  out.pos.lerpVectors(_pa.pos, _pb.pos, fr)
  out.look.lerpVectors(_pa.look, _pb.look, fr)
  // Cinematic arc: lift and swing outward mid-flight so the camera sweeps *around* the universe.
  const s = Math.sin(Math.PI * fr)
  if (s > 0.0001) {
    const c = ZONE_ORIGIN.projects
    _c.set(out.pos.x - c[0], 0, out.pos.z - c[2]).normalize()
    out.pos.addScaledVector(_c, s * 18)
    out.pos.y += s * 6
  }
}

const journeyPose: PoseFn = (out) => {
  const c = ZONE_ORIGIN.journey
  const n = JOURNEY.length
  const s = clamp(world.journey, 0, 1) * (n - 1)
  const i = Math.floor(s)
  // Dwell at each gate, travel between them.
  const eased = i + smoothstep(0.25, 0.75, s - i)
  const z = c[2] - eased * JOURNEY_GATE_SPACING
  frame(out, [c[0], c[1] + 1.6, z + S(15, 24)], [c[0], c[1] + 2.5, z - 12], 0, S(0.12, 0.2))
}

const contactPose: PoseFn = (out) => {
  const c = ZONE_ORIGIN.contact
  frame(out, [c[0], c[1] + 3.5, c[2] + S(26, 44)], [c[0], c[1] + 7, c[2]], S(0.3, 0), S(0, 0.28))
}

export const POSE_FNS: PoseFn[] = [
  gatewayPose,
  heroPose,
  aboutPose,
  educationPose,
  skillsPose,
  projectsPose,
  journeyPose,
  contactPose,
]

const _a = makePose()
const _b = makePose()

/** Samples the camera path at continuous zone-time `t` (0 = gateway, 1 = hero, ... 7 = contact). */
export function samplePose(t: number, out: Pose) {
  const last = POSE_FNS.length - 1
  const tt = clamp(t, 0, last)
  const i = Math.min(Math.floor(tt), last - 1)
  const f = tt - i
  POSE_FNS[i](_a)
  POSE_FNS[i + 1](_b)
  // The intro timeline already eases introT, so the gateway -> hero flight stays linear.
  const e = i === 0 ? f : easeInOutCubic(f)
  out.pos.lerpVectors(_a.pos, _b.pos, e)
  out.look.lerpVectors(_a.look, _b.look, e)
  const s = Math.sin(Math.PI * f)
  if (i === 0) {
    out.pos.y += s * 1.5
  } else {
    out.pos.y += s * 5
    out.pos.x += s * (i % 2 === 0 ? 1 : -1) * 8
  }
}
