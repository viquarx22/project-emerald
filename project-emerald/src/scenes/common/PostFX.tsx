import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { TUNING } from '@/config/tuning'
import { useQuality } from './Zone'

/**
 * Cinematic grade: bloom for emissive emerald, a soft vignette, film grain and ACES tone mapping.
 * Disabled on the "Lite" tier, where the renderer's own tone mapping takes over.
 */
export function PostFX() {
  const q = useQuality()
  if (!q.post) return null
  return (
    <EffectComposer multisampling={q.msaa} enableNormalPass={false}>
      <Bloom
        intensity={TUNING.bloom.intensity}
        luminanceThreshold={TUNING.bloom.threshold}
        luminanceSmoothing={TUNING.bloom.smoothing}
        mipmapBlur
      />
      <Vignette offset={0.22} darkness={0.8} eskil={false} />
      <Noise opacity={0.03} blendFunction={BlendFunction.SOFT_LIGHT} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
