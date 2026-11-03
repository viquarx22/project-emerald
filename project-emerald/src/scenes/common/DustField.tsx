import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { world } from '@/state/world'
import { COLORS } from '@/config/tuning'
import { mulberry32 } from '@/lib/math'
import { dustFragment, dustVertex } from './shaders'
import { useQuality } from './Zone'

const BOX = new THREE.Vector3(90, 52, 90)

/**
 * Atmospheric particles for the entire world in a single draw call.
 * The lattice wraps around the camera inside the vertex shader, so there is no per-frame CPU work
 * beyond updating three uniforms.
 */
export function DustField() {
  const q = useQuality()
  const material = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const rand = mulberry32(7)
    const positions = new Float32Array(q.dust * 3)
    const seeds = new Float32Array(q.dust)
    for (let i = 0; i < q.dust; i++) {
      positions[i * 3] = (rand() - 0.5) * BOX.x
      positions[i * 3 + 1] = (rand() - 0.5) * BOX.y
      positions[i * 3 + 2] = (rand() - 0.5) * BOX.z
      seeds[i] = rand()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return g
  }, [q.dust])

  useEffect(() => () => geometry.dispose(), [geometry])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCam: { value: new THREE.Vector3() },
      uBox: { value: BOX.clone() },
      uSize: { value: 1.5 },
      uPx: { value: 1 },
      uColor: { value: new THREE.Color(COLORS.mint) },
    }),
    [],
  )

  useFrame(({ camera, gl }) => {
    const m = material.current
    if (!m) return
    m.uniforms.uTime.value = world.time
    m.uniforms.uCam.value.copy(camera.position)
    m.uniforms.uPx.value = gl.getPixelRatio()
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
