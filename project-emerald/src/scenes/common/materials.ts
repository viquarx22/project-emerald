import * as THREE from 'three'
import { COLORS } from '@/config/tuning'

/**
 * Shared, long-lived materials. They are created once and disposed explicitly when the world
 * unmounts (see World.tsx). Scene components reference them with <primitive attach="material" />,
 * which React Three Fiber does not auto-dispose.
 */
function build() {
  return {
    metalDark: new THREE.MeshStandardMaterial({ color: '#17382c', metalness: 1, roughness: 0.3 }),
    metalSteel: new THREE.MeshStandardMaterial({ color: '#a9c2b4', metalness: 1, roughness: 0.34 }),
    metalFloor: new THREE.MeshStandardMaterial({ color: '#04130d', metalness: 0.85, roughness: 0.4 }),
    gold: new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 1, roughness: 0.27 }),
    glowAccent: new THREE.MeshStandardMaterial({
      color: COLORS.accent,
      emissive: COLORS.accent,
      emissiveIntensity: 2.4,
      roughness: 0.4,
    }),
    glowMint: new THREE.MeshStandardMaterial({
      color: COLORS.mint,
      emissive: COLORS.mint,
      emissiveIntensity: 2.0,
      roughness: 0.4,
    }),
    glowGold: new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      emissive: COLORS.gold,
      emissiveIntensity: 1.8,
      roughness: 0.4,
    }),
  }
}

let cache: ReturnType<typeof build> | null = null

export function getMaterials() {
  if (!cache) cache = build()
  return cache
}

export function disposeMaterials() {
  if (!cache) return
  Object.values(cache).forEach((m) => m.dispose())
  cache = null
}

/**
 * Emerald glass. With `transmission` the material really refracts the scene behind it
 * (high tier only); otherwise it falls back to a cheap tinted translucent surface.
 */
export function glassProps(transmission: boolean, tint: string = COLORS.accent) {
  if (transmission) {
    return {
      color: '#b9f7da',
      transmission: 1,
      thickness: 1.6,
      roughness: 0.06,
      ior: 1.45,
      attenuationColor: tint,
      attenuationDistance: 2.4,
      envMapIntensity: 1.4,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }
  }
  return {
    color: '#0f7a55',
    transparent: true,
    opacity: 0.5,
    roughness: 0.08,
    metalness: 0.15,
    envMapIntensity: 1.7,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  }
}
