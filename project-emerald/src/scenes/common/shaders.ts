/**
 * Custom GLSL. Kept deliberately small and WebGL2-safe.
 * Each fragment shader ends with the standard three.js tone-mapping / colour-space chunks so the
 * custom materials match the lit materials with or without the post-processing pipeline.
 */
const OUTPUT = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`

/* ------------------------------ Atmospheric dust ------------------------------ */
export const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCam;
  uniform vec3 uBox;
  uniform float uSize;
  uniform float uPx;
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.15 + aSeed * 6.2831) * 0.9;
    p.x += cos(uTime * 0.11 + aSeed * 12.0) * 0.9;

    // The lattice repeats forever around the camera, so one draw call dresses the whole world.
    vec3 rel = mod(p - uCam + uBox * 0.5, uBox) - uBox * 0.5;
    vec3 wp = uCam + rel;
    vec4 mv = viewMatrix * vec4(wp, 1.0);
    gl_Position = projectionMatrix * mv;

    float d = length(rel);
    float size = uSize * uPx * (0.5 + aSeed) * (60.0 / max(-mv.z, 1.0));
    gl_PointSize = clamp(size, 1.0, 7.0 * uPx);

    float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 1.4) + aSeed * 40.0);
    vAlpha = smoothstep(uBox.z * 0.5, uBox.z * 0.2, d) * smoothstep(1.0, 4.0, d) * twinkle;
  }
`

export const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, r) * vAlpha * 0.9;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
    ${OUTPUT}
  }
`

/* --------------------------- Volumetric-style light shaft -------------------------- */
export const beamVertex = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  varying float vHeight;
  void main() {
    vNormalV = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    vHeight = uv.y; // 1 at the apex of the cone, 0 at the base
    gl_Position = projectionMatrix * mv;
  }
`

export const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  varying float vHeight;
  void main() {
    float fres = pow(abs(dot(normalize(vNormalV), normalize(vViewDir))), 2.0);
    float falloff = pow(clamp(vHeight, 0.0, 1.0), 1.25);
    float shimmer = 0.88 + 0.12 * sin(uTime * 0.8 + vHeight * 9.0);
    float a = fres * falloff * shimmer * uIntensity;
    gl_FragColor = vec4(uColor, a);
    ${OUTPUT}
  }
`

/* ------------------------------ Gateway portal veil ------------------------------ */
export const portalVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const portalFragment = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;
    float ang = atan(p.y, p.x);
    float warp = fbm(p * 2.0 + uTime * 0.1);
    float n = fbm(vec2(ang * 1.5 + uTime * 0.05, r * 3.0 - uTime * 0.25) + warp);
    float rim = smoothstep(0.55, 1.0, r);
    vec3 col = mix(uColorA, uColorB, n);
    float a = (0.05 + 0.32 * n * (1.0 - r * 0.5) + rim * 0.3) * uIntensity;
    gl_FragColor = vec4(col * (0.6 + n), a);
    ${OUTPUT}
  }
`

/* ----------------------------------- Grid floor ----------------------------------- */
export const gridVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`

export const gridFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uCell;
  uniform float uOpacity;
  uniform float uRadius;
  uniform vec3 uCenter;
  uniform float uTime;
  varying vec3 vWorld;
  void main() {
    vec2 coord = vWorld.xz / uCell;
    vec2 g = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    float d = length(vWorld.xz - uCenter.xz);
    float fade = 1.0 - smoothstep(uRadius * 0.2, uRadius, d);
    float pulse = 0.65 + 0.35 * sin(d * 0.35 - uTime * 1.4);
    gl_FragColor = vec4(uColor, line * fade * uOpacity * pulse);
    ${OUTPUT}
  }
`

/* ------------------------------ Planet atmosphere shell ------------------------------ */
export const atmosphereVertex = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  void main() {
    vNormalV = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

export const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vNormalV), normalize(vViewDir))), uPower);
    gl_FragColor = vec4(uColor, f * uIntensity);
    ${OUTPUT}
  }
`

/* --------------------------------- Churning star --------------------------------- */
export const starFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  varying vec3 vPos;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    float n000 = hash(i), n100 = hash(i + vec3(1,0,0)), n010 = hash(i + vec3(0,1,0)), n110 = hash(i + vec3(1,1,0));
    float n001 = hash(i + vec3(0,0,1)), n101 = hash(i + vec3(1,0,1)), n011 = hash(i + vec3(0,1,1)), n111 = hash(i + vec3(1,1,1));
    return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y), mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
  }
  void main() {
    float n = noise(vPos * 2.2 + uTime * 0.25) * 0.6 + noise(vPos * 5.0 - uTime * 0.4) * 0.4;
    float rim = pow(1.0 - abs(dot(normalize(vNormalV), normalize(vViewDir))), 2.0);
    vec3 col = mix(uColorA, uColorB, n) * (1.4 + rim * 1.2);
    gl_FragColor = vec4(col, 1.0);
    ${OUTPUT}
  }
`

export const starVertex = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  varying vec3 vPos;
  void main() {
    vPos = position;
    vNormalV = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
