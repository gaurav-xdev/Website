import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// ─── STUDIO ENVIRONMENT FOR METALLIC-OBSIDIAN IBL REFLECTIONS ────────────────
function StudioEnvironment() {
  const { gl, scene } = useThree()

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()
    const room = new RoomEnvironment()
    const envMap = pmrem.fromScene(room, 0.04).texture
    scene.environment = envMap
    scene.environmentIntensity = 0.70

    return () => {
      pmrem.dispose()
      envMap.dispose()
      room.dispose()
    }
  }, [gl, scene])

  return null
}

// ─── WAVE SHADER: 54 UNIFORM SILK CONTOURS MATCHING REFERENCE ─────────────────
const waveVertexShader = `
uniform float uTime;
uniform vec2 uPointer;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vFoldFactor;
varying float vRightFoldFactor;

vec3 deformSurface(vec3 pos, float t) {
  float x = pos.x;
  float y = pos.y;

  // Left dominant silk fold ridge (measured from reference at x ≈ -1.9)
  float leftRidgeY = 0.42 + 0.26 * (x + 2.0);
  float dLeft = y - leftRidgeY;
  float leftMask = exp(-pow((x + 1.85) / 1.45, 2.0));
  float leftFoldY = 0.48 * leftMask * exp(-pow(dLeft / 0.52, 2.0));
  float leftFoldZ = 0.46 * leftMask * exp(-pow(dLeft / 0.62, 2.0));

  // Gentle left trough
  float troughMask = exp(-pow((x + 3.6) / 1.25, 2.0)) * exp(-pow((y + 0.28) / 0.85, 2.0));
  float troughY = -0.28 * troughMask;
  float troughZ = -0.28 * troughMask;

  // Subtle center cradle behind character (keeps lines visible & uniform)
  float centerMask = exp(-pow(x / 1.1, 2.0)) * exp(-pow((y - 0.08) / 0.95, 2.0));
  float centerY = -0.12 * centerMask;
  float centerZ = -0.38 * centerMask;

  // Right secondary fold
  float rightRidgeY = 0.22 + 0.14 * (x - 2.4);
  float dRight = y - rightRidgeY;
  float rightMask = exp(-pow((x - 2.4) / 1.5, 2.0));
  float rightFoldY = 0.28 * rightMask * exp(-pow(dRight / 0.58, 2.0));
  float rightFoldZ = 0.24 * rightMask * exp(-pow(dRight / 0.68, 2.0));

  // Subtle fluid idle breathing
  float breath = sin(t * 0.55 + x * 0.25) * 0.020 + cos(t * 0.40 - y * 0.3) * 0.014;

  // Very subtle mouse wave
  float mDist = length(vec2(x - uPointer.x * 3.5, y - uPointer.y * 1.8));
  float mouseRipple = sin(mDist * 1.8 - t * 1.8) * exp(-mDist * 0.6) * 0.022;

  return vec3(
    x,
    y + leftFoldY + troughY + centerY + rightFoldY + breath + mouseRipple,
    -1.0 + leftFoldZ + troughZ + centerZ + rightFoldZ
  );
}

void main() {
  vUv = uv;

  vec3 displaced = deformSurface(position, uTime);

  float eps = 0.035;
  vec3 dpx = deformSurface(position + vec3(eps, 0.0, 0.0), uTime);
  vec3 dpy = deformSurface(position + vec3(0.0, eps, 0.0), uTime);
  vec3 tangX = normalize(dpx - displaced);
  vec3 tangY = normalize(dpy - displaced);
  vec3 n = normalize(cross(tangX, tangY));
  if (n.z < 0.0) n = -n;

  vNormal = normalMatrix * n;

  float x = position.x;
  float y = position.y;
  float leftRidgeY = 0.42 + 0.26 * (x + 2.0);
  float dLeft = y - leftRidgeY;
  float leftMask = exp(-pow((x + 1.85) / 1.45, 2.0));
  vFoldFactor = leftMask * exp(-pow(dLeft / 0.40, 2.0));

  float rightRidgeY = 0.22 + 0.14 * (x - 2.4);
  float dRight = y - rightRidgeY;
  float rightMask = exp(-pow((x - 2.4) / 1.5, 2.0));
  vRightFoldFactor = rightMask * exp(-pow(dRight / 0.50, 2.0));

  vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
  vViewPosition = -mvPos.xyz;
  gl_Position = projectionMatrix * mvPos;
}
`

const waveFragmentShader = `
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vFoldFactor;
varying float vRightFoldFactor;

void main() {
  // 54 uniform contour lines
  float numLines = 54.0;
  float lineCoord = vUv.y * numLines;
  float dist = abs(fract(lineCoord - 0.5) - 0.5);
  float dd = fwidth(lineCoord);

  float lineCore = 1.0 - smoothstep(0.0, dd * 1.2 + 0.018, dist);
  float lineGlow = (1.0 - smoothstep(0.0, dd * 3.5 + 0.055, dist)) * 0.32;
  float lineMask = clamp(lineCore + lineGlow, 0.0, 1.0);

  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Key light from upper-left
  vec3 lightDir = normalize(vec3(-0.48, 0.88, 0.80));
  vec3 halfDir = normalize(lightDir + viewDir);

  float diffuse = max(0.0, dot(normal, lightDir));
  float spec = pow(max(0.0, dot(normal, halfDir)), 26.0);
  float rim = pow(1.0 - max(0.0, dot(normal, viewDir)), 2.0);

  float foldGlow = vFoldFactor * 1.9 + vRightFoldFactor * 0.9;
  float totalLight = 0.14 + 0.46 * diffuse + 2.0 * spec + 0.28 * rim + 1.3 * foldGlow;

  // Line colors
  vec3 darkLine   = vec3(0.18, 0.17, 0.24);
  vec3 midLine    = vec3(0.54, 0.52, 0.64);
  vec3 brightLine = vec3(1.00, 1.00, 1.00);

  vec3 lineColor;
  if (totalLight < 0.75) {
    lineColor = mix(darkLine, midLine, totalLight / 0.75);
  } else {
    lineColor = mix(midLine, brightLine, clamp((totalLight - 0.75) / 1.35, 0.0, 1.0));
  }

  vec3 bgColor = vec3(0.026, 0.024, 0.034);
  float distC = length(vec2(vUv.x - 0.50, (vUv.y - 0.52) * 1.55));
  vec3 atmos = vec3(0.10, 0.08, 0.16) * exp(-distC * distC * 4.5);
  bgColor += atmos + vec3(0.014) * diffuse;

  float bgAlpha = 0.28 * exp(-distC * 2.0);

  float hFade = cos((vUv.x - 0.5) * 3.14159 * 0.90);
  float vFade = sin(vUv.y * 3.14159);
  float edge = clamp(hFade * vFade, 0.0, 1.0);

  vec3 finalColor = mix(bgColor, lineColor, lineMask);
  float finalAlpha = (bgAlpha * (1.0 - lineMask) + lineMask * clamp(totalLight, 0.18, 1.0)) * edge;

  gl_FragColor = vec4(finalColor, finalAlpha);
}
`

function TopographicalSilkWaveMesh({ pointer }: { pointer: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    []
  )

  useFrame((state) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.ShaderMaterial
    mat.uniforms.uTime.value = state.clock.getElapsedTime() * 0.60
    mat.uniforms.uPointer.value.set(pointer.x, pointer.y)
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[22, 11, 220, 220]} />
      <shaderMaterial
        vertexShader={waveVertexShader}
        fragmentShader={waveFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function HeroScene() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      setPointer({ x, y })
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 40 }}
        dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        className="w-full h-full"
      >
        {/* High-fidelity Studio Environment Map for metallic-obsidian IBL reflections */}
        <StudioEnvironment />

        {/* Soft studio ambient — ensures obsidian stays deep rich black */}
        <ambientLight intensity={0.28} />

        {/* Primary Key Light — angled from upper-left to create the curved specular highlight on head & body */}
        <directionalLight
          position={[-4.2, 3.4, 3.8]}
          intensity={5.8}
          color="#ffffff"
        />

        {/* Soft fill light from the right — softly illuminates pearl hands */}
        <directionalLight
          position={[3.8, 1.8, 2.5]}
          intensity={1.6}
          color="#9598b0"
        />

        {/* Gentle rim light */}
        <pointLight
          position={[0, 4.0, -1.5]}
          intensity={0.8}
          color="#ffffff"
        />

        {/* 1. 3D Wave silk contours */}
        <TopographicalSilkWaveMesh pointer={pointer} />
      </Canvas>
    </div>
  )
}
