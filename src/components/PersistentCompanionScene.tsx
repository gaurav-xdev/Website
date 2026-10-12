import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { PageRoute } from '../App'

// ─── STUDIO ENVIRONMENT FOR HIGH-FIDELITY METALLIC-OBSIDIAN REFLECTIONS ───────
function StudioEnvironment() {
  const { gl, scene } = useThree()

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()
    const room = new RoomEnvironment()
    const envMap = pmrem.fromScene(room, 0.04).texture
    scene.environment = envMap
    scene.environmentIntensity = 0.78

    return () => {
      pmrem.dispose()
      envMap.dispose()
      room.dispose()
    }
  }, [gl, scene])

  return null
}

// ─── MOTION PATH KEYFRAME DEFINITIONS ────────────────────────────────────────
interface Keyframe {
  progress: number
  x: number
  y: number
  z: number
  rotX: number
  rotY: number
  rotZ: number
  scale: number
}

// Deliberately art-directed motion path for the Home flagship journey
// Positioned exclusively in negative space & natural composition anchors to protect content readability
const HOME_KEYFRAMES: Keyframe[] = [
  // 1. Hero Stage: centered above headline & wave
  { progress: 0.00, x: 0.00, y: 0.75, z: 0.00, rotX: 0.00, rotY: 0.00, rotZ: 0.00, scale: 1.28 },
  // Smooth departure from Hero as scrolling begins
  { progress: 0.08, x: 0.00, y: 0.45, z: 0.15, rotX: 0.04, rotY: 0.00, rotZ: 0.00, scale: 1.25 },
  // 2. Giant Brand Section: nestled directly in the "M" notch of "OSMOO" (matching reference)
  { progress: 0.18, x: 0.00, y: 0.18, z: 0.35, rotX: 0.06, rotY: 0.00, rotZ: 0.00, scale: 1.18 },
  // Smooth glide out of the "M" toward the right negative space flank
  { progress: 0.27, x: 2.20, y: 0.30, z: 0.30, rotX: 0.05, rotY: -0.25, rotZ: -0.02, scale: 1.05 },
  // 3. MacBook Hardware Showcase: elevated in upper-right negative space above laptop lid
  { progress: 0.38, x: 3.55, y: 0.65, z: 0.35, rotX: 0.06, rotY: -0.38, rotZ: -0.03, scale: 0.82 },
  // 4. "MORE THAN A CHAT WINDOW" headline transition (stays in right flank margin)
  { progress: 0.48, x: 3.65, y: 0.45, z: 0.30, rotX: 0.03, rotY: -0.32, rotZ: 0.00, scale: 0.80 },
  // 5. Pipeline 4-Stage Cards: floats in right margin negative space, clear of cards
  { progress: 0.58, x: 3.70, y: 0.35, z: 0.25, rotX: 0.04, rotY: -0.34, rotZ: -0.02, scale: 0.76 },
  // 6. Ecosystem Section ("BRIDGING YOUR ENTIRE TOOLCHAIN"): right margin flank
  { progress: 0.72, x: 3.75, y: 0.30, z: 0.25, rotX: 0.05, rotY: -0.32, rotZ: 0.00, scale: 0.76 },
  // 7. Direct Engineering Inquiry & Footer: docked safely in right margin clear of links
  { progress: 0.86, x: 3.65, y: 0.05, z: 0.20, rotX: 0.08, rotY: -0.28, rotZ: 0.00, scale: 0.74 },
  { progress: 1.00, x: 3.65, y: 0.15, z: 0.20, rotX: 0.10, rotY: -0.25, rotZ: 0.00, scale: 0.74 },
]

// Hermite / Smoothstep Piecewise Interpolator
function interpolateKeyframes(keyframes: Keyframe[], progress: number): Keyframe {
  const p = Math.max(0, Math.min(1, progress))

  // Find surrounding segment
  for (let i = 0; i < keyframes.length - 1; i++) {
    const k0 = keyframes[i]
    const k1 = keyframes[i + 1]

    if (p >= k0.progress && p <= k1.progress) {
      const segT = (p - k0.progress) / (k1.progress - k0.progress)
      // Smoothstep easing for zero velocity at boundaries
      const t = segT * segT * (3 - 2 * segT)

      return {
        progress: p,
        x: THREE.MathUtils.lerp(k0.x, k1.x, t),
        y: THREE.MathUtils.lerp(k0.y, k1.y, t),
        z: THREE.MathUtils.lerp(k0.z, k1.z, t),
        rotX: THREE.MathUtils.lerp(k0.rotX, k1.rotX, t),
        rotY: THREE.MathUtils.lerp(k0.rotY, k1.rotY, t),
        rotZ: THREE.MathUtils.lerp(k0.rotZ, k1.rotZ, t),
        scale: THREE.MathUtils.lerp(k0.scale, k1.scale, t),
      }
    }
  }

  return keyframes[keyframes.length - 1]
}

// ─── 3D COMPANION MODEL WITH LIVE HEAD TRACKING, SCROLL & PRICING EXPRESSIONS ───
export type CompanionExpression = 'neutral' | 'free' | 'pro' | 'max' | 'enterprise'

export interface ExpressionParams {
  headPitch: number     // rotX offset (positive = look down toward cards)
  headYaw: number       // rotY offset (positive = look left toward cards)
  headRoll: number      // rotZ offset (tilt)
  headYOffset: number   // head position.y offset
  bodyYaw: number       // torso rotation.y offset toward card
  leanX: number         // whole body lean offset toward the cards
  
  // Left eye
  leftEyeRotZ: number   // base is -0.12
  leftEyeScaleX: number // base is 1.0
  leftEyeScaleY: number // base is 1.0
  leftEyePosY: number   // base is 0.008
  leftUpperLidAmount: number // 0 = retracted, 1 = lowered over top of eye
  leftLowerLidAmount: number // 0 = retracted, 1 = raised over bottom of eye (smile)
  
  // Right eye
  rightEyeRotZ: number  // base is +0.12
  rightEyeScaleX: number
  rightEyeScaleY: number
  rightEyePosY: number
  rightUpperLidAmount: number
  rightLowerLidAmount: number
  
  // Hand posture offsets
  leftHandYOff: number
  leftHandXOff: number
  rightHandYOff: number
  rightHandXOff: number
  
  // Eye glow emission
  glowIntensity: number // base is 2.5
  
  // Dynamic celebration / bounce / flutter
  bounceAmp: number
  bounceFreq: number
  handFlutter: boolean
}

export const EXPRESSION_PROFILES: Record<CompanionExpression, ExpressionParams> = {
  neutral: {
    headPitch: 0.0,
    headYaw: 0.0,
    headRoll: 0.0,
    headYOffset: 0.0,
    bodyYaw: 0.0,
    leanX: 0.0,

    leftEyeRotZ: -0.12,
    leftEyeScaleX: 1.0,
    leftEyeScaleY: 1.0,
    leftEyePosY: 0.008,
    leftUpperLidAmount: 0.0,
    leftLowerLidAmount: 0.0,

    rightEyeRotZ: 0.12,
    rightEyeScaleX: 1.0,
    rightEyeScaleY: 1.0,
    rightEyePosY: 0.008,
    rightUpperLidAmount: 0.0,
    rightLowerLidAmount: 0.0,

    leftHandYOff: 0.0,
    leftHandXOff: 0.0,
    rightHandYOff: 0.0,
    rightHandXOff: 0.0,

    glowIntensity: 2.5,
    bounceAmp: 0.0,
    bounceFreq: 0.0,
    handFlutter: false,
  },

  free: {
    // Looks directly at Free card (far left) with sad, cute puppy droop
    headPitch: 0.34,      // look down directly at Free card
    headYaw: 0.65,        // turn head left toward Free card
    headRoll: -0.10,      // cute empathetic tilt
    headYOffset: -0.024,  // head droops down on neck
    bodyYaw: 0.30,        // torso turns toward Free card
    leanX: -0.38,         // lean inward toward the card

    // Sad puppy eyes: outer corners droop downward + softened height
    leftEyeRotZ: 0.25,    // tilted outward-downward
    leftEyeScaleX: 0.86,
    leftEyeScaleY: 0.58,  // drooped sad eye height
    leftEyePosY: -0.006,
    leftUpperLidAmount: 0.68, // upper eyelids lowered sadly
    leftLowerLidAmount: 0.0,

    rightEyeRotZ: -0.25,  // symmetrical drooping outer corner
    rightEyeScaleX: 0.86,
    rightEyeScaleY: 0.58,
    rightEyePosY: -0.006,
    rightUpperLidAmount: 0.68,
    rightLowerLidAmount: 0.0,

    // Hands tucked in shyly
    leftHandYOff: -0.045,
    leftHandXOff: 0.05,
    rightHandYOff: -0.045,
    rightHandXOff: -0.05,

    glowIntensity: 1.95,  // soft, subdued melancholy glow
    bounceAmp: 0.0,
    bounceFreq: 0.0,
    handFlutter: false,
  },

  pro: {
    // Looks directly at Pro card (middle left) with warm happy smile
    headPitch: 0.28,      // look down directly at Pro card
    headYaw: 0.44,        // turn head toward Pro card
    headRoll: 0.12,       // charming inquisitive head tilt
    headYOffset: 0.012,
    bodyYaw: 0.20,        // torso turns toward Pro card
    leanX: -0.22,         // lean gently toward card

    // Happy smiling squint arc (^  ^)
    leftEyeRotZ: -0.18,
    leftEyeScaleX: 1.10,
    leftEyeScaleY: 0.82,
    leftEyePosY: 0.012,
    leftUpperLidAmount: 0.0,
    leftLowerLidAmount: 0.52, // lower eyelids push upward for smile arc

    rightEyeRotZ: 0.18,
    rightEyeScaleX: 1.10,
    rightEyeScaleY: 0.82,
    rightEyePosY: 0.012,
    rightUpperLidAmount: 0.0,
    rightLowerLidAmount: 0.52,

    // Welcoming relaxed open hands
    leftHandYOff: 0.03,
    leftHandXOff: -0.025,
    rightHandYOff: 0.03,
    rightHandXOff: 0.025,

    glowIntensity: 2.85,  // warm radiant glow
    bounceAmp: 0.010,     // subtle happy harmonic float
    bounceFreq: 2.4,
    handFlutter: false,
  },

  max: {
    // Looks directly at Max card (middle right) — VERY HAPPY & ECSTATIC!
    headPitch: 0.22,      // look down toward Max card
    headYaw: 0.22,        // turn head toward Max card
    headRoll: 0.04,
    headYOffset: 0.030,   // lifted joyous head
    bodyYaw: 0.10,
    leanX: -0.10,

    // VERY HAPPY: wide open, radiant, beaming ecstatic eyes!
    leftEyeRotZ: -0.08,
    leftEyeScaleX: 1.25,
    leftEyeScaleY: 1.30,  // big excited eyes!
    leftEyePosY: 0.018,
    leftUpperLidAmount: 0.0,
    leftLowerLidAmount: 0.0,

    rightEyeRotZ: 0.08,
    rightEyeScaleX: 1.25,
    rightEyeScaleY: 1.30,
    rightEyePosY: 0.018,
    rightUpperLidAmount: 0.0,
    rightLowerLidAmount: 0.0,

    // Cheerful buoyant hands
    leftHandYOff: 0.07,
    leftHandXOff: -0.045,
    rightHandYOff: 0.07,
    rightHandXOff: 0.045,

    glowIntensity: 3.85,  // brilliant, energetic emission!
    bounceAmp: 0.036,     // joyous rhythmic celebratory bounce!
    bounceFreq: 5.4,
    handFlutter: true,    // fluttering happy hands!
  },

  enterprise: {
    // Joyfully roaming across the screen in celebratory flight!
    headPitch: -0.06,     // looking forward during joyful flight
    headYaw: 0.0,
    headRoll: 0.0,
    headYOffset: 0.025,
    bodyYaw: 0.0,
    leanX: 0.0,

    // Gleeful joyful smiling eyes during roaming!
    leftEyeRotZ: -0.14,
    leftEyeScaleX: 1.20,
    leftEyeScaleY: 1.10,
    leftEyePosY: 0.014,
    leftUpperLidAmount: 0.0,
    leftLowerLidAmount: 0.45,

    rightEyeRotZ: 0.14,
    rightEyeScaleX: 1.20,
    rightEyeScaleY: 1.10,
    rightEyePosY: 0.014,
    rightUpperLidAmount: 0.0,
    rightLowerLidAmount: 0.45,

    // Wing-like floating pearl hands
    leftHandYOff: 0.05,
    leftHandXOff: -0.06,
    rightHandYOff: 0.05,
    rightHandXOff: 0.06,

    glowIntensity: 3.70,  // brilliant joyful sparkle
    bounceAmp: 0.022,     // buoyant flight bob
    bounceFreq: 4.5,
    handFlutter: true,    // joyful wing flutter!
  },
}

interface ActiveCompanionProps {
  currentPage: PageRoute
  pointer: { x: number; y: number }
  expression?: CompanionExpression
}

function ActiveCompanion({ currentPage, pointer, expression = 'neutral' }: ActiveCompanionProps) {
  const rootGroupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const leftHandRef = useRef<THREE.Group>(null)
  const rightHandRef = useRef<THREE.Group>(null)

  // Eye & Eyelid refs for expressive reactivity
  const leftEyeGroupRef = useRef<THREE.Group>(null)
  const rightEyeGroupRef = useRef<THREE.Group>(null)
  const leftEyeMeshRef = useRef<THREE.Mesh>(null)
  const rightEyeMeshRef = useRef<THREE.Mesh>(null)
  const leftUpperLidRef = useRef<THREE.Mesh>(null)
  const rightUpperLidRef = useRef<THREE.Mesh>(null)
  const leftLowerLidRef = useRef<THREE.Mesh>(null)
  const rightLowerLidRef = useRef<THREE.Mesh>(null)

  // Current damped expression state
  const currentExpressionState = useRef<ExpressionParams>({ ...EXPRESSION_PROFILES.neutral })

  // Current damped scroll progress & transform vectors
  const currentProgress = useRef(0)
  const currentPos = useRef(new THREE.Vector3(0, 0.75, 0))
  const currentRot = useRef(new THREE.Euler(0, 0, 0))
  const currentScale = useRef(1.28)

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [])

  // Load the centered, split 3D model
  const { nodes } = useGLTF('/osmoo_character.glb') as unknown as {
    nodes: {
      Body: THREE.Mesh
      Head: THREE.Mesh
      LeftHand: THREE.Mesh
      RightHand: THREE.Mesh
    }
  }

  // Ultra-Premium Metallic-Obsidian Material
  // Meticulously balanced dark titanium / obsidian alloy with liquid-metal lacquer clearcoat
  const obsidianMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#0f0e15'),
        roughness: 0.16,
        metalness: 0.78,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        reflectivity: 0.98,
        ior: 1.82,
        specularIntensity: 1.0,
        specularColor: new THREE.Color('#e0e4f8'),
      }),
    []
  )

  // Floating Ceramic Pearl Hands — exquisite pearlescent luster
  const pearlHandMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#f6f7fc'),
        roughness: 0.15,
        metalness: 0.06,
        clearcoat: 0.90,
        clearcoatRoughness: 0.05,
        ior: 1.55,
        reflectivity: 0.92,
      }),
    []
  )

  // Glowing Eye Material (dynamically responsive emission)
  const eyeCoreMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(2.5, 2.5, 2.5),
        toneMapped: false,
      }),
    []
  )

  const eyeCoreGeom = useMemo(() => new THREE.CapsuleGeometry(0.052, 0.12, 32, 32), [])
  const eyelidGeom = useMemo(() => new THREE.CapsuleGeometry(0.054, 0.05, 16, 16), [])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // 1. Calculate target scroll progress
    let targetP = 0
    if (typeof window !== 'undefined') {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      targetP = Math.max(0, Math.min(1, window.scrollY / maxScroll))
    }

    // Smoothly damp scroll progress to eliminate rapid-scroll jitter
    currentProgress.current = THREE.MathUtils.damp(currentProgress.current, targetP, 5.5, delta)

    // 2. Compute motion path keyframe based on route
    let targetTransform: Keyframe

    if (currentPage === 'home') {
      targetTransform = interpolateKeyframes(HOME_KEYFRAMES, currentProgress.current)
    } else if (currentPage === 'pricing') {
      if (expression === 'enterprise') {
        // Joyfully roaming across the screen in an elegant looping swoop flight path!
        const roamSpeed = 1.35
        const roamX = Math.sin(t * roamSpeed) * 2.3 + Math.cos(t * roamSpeed * 0.5) * 0.7
        const roamY = 0.85 + Math.cos(t * roamSpeed * 1.3) * 0.75 + Math.sin(t * roamSpeed * 0.6) * 0.25
        const roamZ = 0.35 + Math.sin(t * roamSpeed * 1.8) * 0.2

        // Flight dynamics: banking roll & yaw toward velocity vector
        const vx = Math.cos(t * roamSpeed) * 2.3 * roamSpeed - Math.sin(t * roamSpeed * 0.5) * 0.35
        const bankRoll = THREE.MathUtils.clamp(-vx * 0.045, -0.25, 0.25)
        const bankYaw = THREE.MathUtils.clamp(Math.atan2(vx, 3.2), -0.5, 0.5)

        targetTransform = {
          progress: currentProgress.current,
          x: roamX,
          y: roamY,
          z: roamZ,
          rotX: -0.05,
          rotY: bankYaw,
          rotZ: bankRoll,
          scale: 0.92,
        }
      } else {
        // Stationed in the upper right negative space above the pricing cards, looking over plans
        targetTransform = {
          progress: currentProgress.current,
          x: 2.85,
          y: 0.85 - currentProgress.current * 0.35,
          z: 0.25,
          rotX: 0.08,
          rotY: -0.38,
          rotZ: -0.02,
          scale: 0.85,
        }
      }
    } else if (currentPage === 'how-it-works') {
      // Stationed in negative space beside the process cards
      targetTransform = {
        progress: currentProgress.current,
        x: 2.75,
        y: 0.60 - currentProgress.current * 0.8,
        z: 0.30,
        rotX: 0.04,
        rotY: -0.30,
        rotZ: 0.00,
        scale: 0.88,
      }
    } else if (currentPage === 'privacy') {
      targetTransform = {
        progress: currentProgress.current,
        x: 2.80,
        y: 0.60 - currentProgress.current * 0.6,
        z: 0.20,
        rotX: 0.05,
        rotY: -0.32,
        rotZ: 0.00,
        scale: 0.86,
      }
    } else if (currentPage === 'faq') {
      targetTransform = {
        progress: currentProgress.current,
        x: 2.80,
        y: 0.60 - currentProgress.current * 0.6,
        z: 0.20,
        rotX: 0.05,
        rotY: -0.30,
        rotZ: 0.00,
        scale: 0.86,
      }
    } else {
      // Download hub: welcoming centered pose at top
      targetTransform = {
        progress: currentProgress.current,
        x: 0.00,
        y: 0.80,
        z: 0.20,
        rotX: 0.00,
        rotY: 0.00,
        rotZ: 0.00,
        scale: 1.10,
      }
    }

    // 3. Responsive screen width compensation (mobile & tablet)
    const aspect = state.viewport.aspect
    let responsiveX = targetTransform.x
    let responsiveScale = targetTransform.scale

    if (aspect < 0.8) {
      // Mobile portrait view: keep within narrow viewport margins
      if (currentPage === 'pricing') {
        if (expression === 'enterprise') {
          // Roaming across mobile header in a joyful loop
          const roamSpeed = 1.4
          responsiveX = Math.sin(t * roamSpeed) * 0.75
          targetTransform.y = 2.48 + Math.cos(t * roamSpeed) * 0.20
          responsiveScale = 0.46
        } else {
          responsiveX = 0.0
          targetTransform.y = 2.48
          responsiveScale = 0.46
        }
      } else {
        responsiveX = THREE.MathUtils.clamp(targetTransform.x * 0.35, -0.65, 0.65)
        responsiveScale = targetTransform.scale * 0.72
      }
    } else if (aspect < 1.3) {
      // Tablet view
      responsiveX = targetTransform.x * 0.65
      responsiveScale = targetTransform.scale * 0.85
    }

    // 4. Subtle idle breathing & mouse parallax (disabled under reduced motion)
    let idleY = 0
    let mouseParallaxX = 0
    let mouseParallaxY = 0

    if (!prefersReducedMotion) {
      idleY = Math.sin(t * 1.3) * 0.022
      mouseParallaxX = pointer.x * 0.12
      mouseParallaxY = pointer.y * 0.08
    }

    // ─── 5. REACTIVE EXPRESSION INTERPOLATION ────────────────────────────────
    const targetExpr = EXPRESSION_PROFILES[expression] || EXPRESSION_PROFILES.neutral
    const exprDampSpeed = expression === 'free' ? 4.5 : 6.0
    const curr = currentExpressionState.current

    curr.headPitch = THREE.MathUtils.damp(curr.headPitch, targetExpr.headPitch, exprDampSpeed, delta)
    curr.headYaw = THREE.MathUtils.damp(curr.headYaw, targetExpr.headYaw, exprDampSpeed, delta)
    curr.headRoll = THREE.MathUtils.damp(curr.headRoll, targetExpr.headRoll, exprDampSpeed, delta)
    curr.headYOffset = THREE.MathUtils.damp(curr.headYOffset, targetExpr.headYOffset, exprDampSpeed, delta)
    curr.bodyYaw = THREE.MathUtils.damp(curr.bodyYaw, targetExpr.bodyYaw, exprDampSpeed, delta)
    curr.leanX = THREE.MathUtils.damp(curr.leanX, targetExpr.leanX, exprDampSpeed, delta)

    curr.leftEyeRotZ = THREE.MathUtils.damp(curr.leftEyeRotZ, targetExpr.leftEyeRotZ, exprDampSpeed, delta)
    curr.leftEyeScaleX = THREE.MathUtils.damp(curr.leftEyeScaleX, targetExpr.leftEyeScaleX, exprDampSpeed, delta)
    curr.leftEyeScaleY = THREE.MathUtils.damp(curr.leftEyeScaleY, targetExpr.leftEyeScaleY, exprDampSpeed, delta)
    curr.leftEyePosY = THREE.MathUtils.damp(curr.leftEyePosY, targetExpr.leftEyePosY, exprDampSpeed, delta)
    curr.leftUpperLidAmount = THREE.MathUtils.damp(curr.leftUpperLidAmount, targetExpr.leftUpperLidAmount, exprDampSpeed, delta)
    curr.leftLowerLidAmount = THREE.MathUtils.damp(curr.leftLowerLidAmount, targetExpr.leftLowerLidAmount, exprDampSpeed, delta)

    curr.rightEyeRotZ = THREE.MathUtils.damp(curr.rightEyeRotZ, targetExpr.rightEyeRotZ, exprDampSpeed, delta)
    curr.rightEyeScaleX = THREE.MathUtils.damp(curr.rightEyeScaleX, targetExpr.rightEyeScaleX, exprDampSpeed, delta)
    curr.rightEyeScaleY = THREE.MathUtils.damp(curr.rightEyeScaleY, targetExpr.rightEyeScaleY, exprDampSpeed, delta)
    curr.rightEyePosY = THREE.MathUtils.damp(curr.rightEyePosY, targetExpr.rightEyePosY, exprDampSpeed, delta)
    curr.rightUpperLidAmount = THREE.MathUtils.damp(curr.rightUpperLidAmount, targetExpr.rightUpperLidAmount, exprDampSpeed, delta)
    curr.rightLowerLidAmount = THREE.MathUtils.damp(curr.rightLowerLidAmount, targetExpr.rightLowerLidAmount, exprDampSpeed, delta)

    curr.leftHandYOff = THREE.MathUtils.damp(curr.leftHandYOff, targetExpr.leftHandYOff, exprDampSpeed, delta)
    curr.leftHandXOff = THREE.MathUtils.damp(curr.leftHandXOff, targetExpr.leftHandXOff, exprDampSpeed, delta)
    curr.rightHandYOff = THREE.MathUtils.damp(curr.rightHandYOff, targetExpr.rightHandYOff, exprDampSpeed, delta)
    curr.rightHandXOff = THREE.MathUtils.damp(curr.rightHandXOff, targetExpr.rightHandXOff, exprDampSpeed, delta)

    curr.glowIntensity = THREE.MathUtils.damp(curr.glowIntensity, targetExpr.glowIntensity, exprDampSpeed, delta)
    curr.bounceAmp = THREE.MathUtils.damp(curr.bounceAmp, targetExpr.bounceAmp, exprDampSpeed, delta)
    curr.bounceFreq = THREE.MathUtils.damp(curr.bounceFreq, targetExpr.bounceFreq, exprDampSpeed, delta)

    // Dynamic eye emission update
    eyeCoreMat.color.setRGB(curr.glowIntensity, curr.glowIntensity, curr.glowIntensity)

    // Controlled head bounce (disabled under reduced motion)
    const bounceY = (!prefersReducedMotion && curr.bounceAmp > 0) ? Math.sin(t * curr.bounceFreq) * curr.bounceAmp : 0

    // ─── 6. APPLY SMOOTH DAMPING TO ROOT POSITION, ROTATION, AND SCALE ────────
    currentPos.current.x = THREE.MathUtils.damp(currentPos.current.x, responsiveX + mouseParallaxX + curr.leanX, 5.0, delta)
    currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, targetTransform.y + idleY + mouseParallaxY, 5.0, delta)
    currentPos.current.z = THREE.MathUtils.damp(currentPos.current.z, targetTransform.z, 5.0, delta)

    currentRot.current.x = THREE.MathUtils.damp(currentRot.current.x, targetTransform.rotX, 4.5, delta)
    currentRot.current.y = THREE.MathUtils.damp(currentRot.current.y, targetTransform.rotY, 4.5, delta)
    currentRot.current.z = THREE.MathUtils.damp(currentRot.current.z, targetTransform.rotZ, 4.5, delta)

    currentScale.current = THREE.MathUtils.damp(currentScale.current, responsiveScale, 5.0, delta)

    if (rootGroupRef.current) {
      rootGroupRef.current.position.copy(currentPos.current)
      rootGroupRef.current.rotation.copy(currentRot.current)
      rootGroupRef.current.scale.setScalar(currentScale.current)
    }

    // ─── 7. HEAD & NECK ORIENTATION ──────────────────────────────────────────
    if (headRef.current) {
      let targetHeadRotY = curr.headYaw
      let targetHeadRotX = curr.headPitch
      let targetHeadRotZ = curr.headRoll

      if (!prefersReducedMotion) {
        targetHeadRotY += pointer.x * 0.24 + Math.sin(t * 1.1) * 0.012
        targetHeadRotX += -pointer.y * 0.16 + Math.cos(t * 0.9) * 0.008
        targetHeadRotZ += -pointer.x * 0.07 + Math.sin(t * 0.7) * 0.006
      }

      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetHeadRotY, 0.08)
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetHeadRotX, 0.08)
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, targetHeadRotZ, 0.08)

      // Neck breathing with physical gap preserved above body + expression offset + celebratory bounce
      const breath = prefersReducedMotion ? 0 : Math.sin(t * 1.6) * 0.008
      headRef.current.position.y = 0.62 + curr.headYOffset + bounceY + breath
    }

    // ─── 8. EYES & EYELID ANIMATION ──────────────────────────────────────────
    if (leftEyeGroupRef.current) {
      leftEyeGroupRef.current.rotation.z = curr.leftEyeRotZ
      leftEyeGroupRef.current.position.y = curr.leftEyePosY
    }
    if (leftEyeMeshRef.current) {
      leftEyeMeshRef.current.scale.set(curr.leftEyeScaleX, curr.leftEyeScaleY, 1.0)
    }
    if (leftUpperLidRef.current) {
      const s = curr.leftUpperLidAmount
      if (s > 0.01) {
        leftUpperLidRef.current.visible = true
        leftUpperLidRef.current.scale.set(1.04, s, 1.04)
        leftUpperLidRef.current.position.y = 0.065 + (1 - s) * 0.035
      } else {
        leftUpperLidRef.current.visible = false
      }
    }
    if (leftLowerLidRef.current) {
      const s = curr.leftLowerLidAmount
      if (s > 0.01) {
        leftLowerLidRef.current.visible = true
        leftLowerLidRef.current.scale.set(1.04, s, 1.04)
        leftLowerLidRef.current.position.y = -0.065 - (1 - s) * 0.035
      } else {
        leftLowerLidRef.current.visible = false
      }
    }

    if (rightEyeGroupRef.current) {
      rightEyeGroupRef.current.rotation.z = curr.rightEyeRotZ
      rightEyeGroupRef.current.position.y = curr.rightEyePosY
    }
    if (rightEyeMeshRef.current) {
      rightEyeMeshRef.current.scale.set(curr.rightEyeScaleX, curr.rightEyeScaleY, 1.0)
    }
    if (rightUpperLidRef.current) {
      const s = curr.rightUpperLidAmount
      if (s > 0.01) {
        rightUpperLidRef.current.visible = true
        rightUpperLidRef.current.scale.set(1.04, s, 1.04)
        rightUpperLidRef.current.position.y = 0.065 + (1 - s) * 0.035
      } else {
        rightUpperLidRef.current.visible = false
      }
    }
    if (rightLowerLidRef.current) {
      const s = curr.rightLowerLidAmount
      if (s > 0.01) {
        rightLowerLidRef.current.visible = true
        rightLowerLidRef.current.scale.set(1.04, s, 1.04)
        rightLowerLidRef.current.position.y = -0.065 - (1 - s) * 0.035
      } else {
        rightLowerLidRef.current.visible = false
      }
    }

    // ─── 9. BODY INERTIA & CARD LOOK ORIENTATION ────────────────────────────
    if (bodyRef.current) {
      let targetBodyYaw = curr.bodyYaw
      if (!prefersReducedMotion) {
        targetBodyYaw += pointer.x * 0.08
      }
      bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, targetBodyYaw, 0.06)
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(
        bodyRef.current.rotation.x,
        prefersReducedMotion ? 0 : -pointer.y * 0.05,
        0.04
      )
    }

    // ─── 10. FLOATING PEARL HANDS ───────────────────────────────────────────
    if (leftHandRef.current) {
      const flutter = (!prefersReducedMotion && targetExpr.handFlutter) ? Math.sin(t * 8.5) * 0.03 : 0
      const handBounce = (!prefersReducedMotion && curr.bounceAmp > 0) ? Math.sin(t * curr.bounceFreq + 0.5) * curr.bounceAmp * 0.6 : 0
      const idle = prefersReducedMotion ? 0 : Math.sin(t * 1.7 + 0.5) * 0.020
      leftHandRef.current.position.y = -0.462 + curr.leftHandYOff + handBounce + idle + flutter
      leftHandRef.current.position.x = -0.572 + curr.leftHandXOff + (prefersReducedMotion ? 0 : Math.cos(t * 1.1) * 0.008)
    }
    if (rightHandRef.current) {
      const flutter = (!prefersReducedMotion && targetExpr.handFlutter) ? Math.sin(t * 8.5 + 2.0) * 0.03 : 0
      const handBounce = (!prefersReducedMotion && curr.bounceAmp > 0) ? Math.sin(t * curr.bounceFreq + 2.2) * curr.bounceAmp * 0.6 : 0
      const idle = prefersReducedMotion ? 0 : Math.sin(t * 1.7 + 2.2) * 0.020
      rightHandRef.current.position.y = -0.464 + curr.rightHandYOff + handBounce + idle + flutter
      rightHandRef.current.position.x = 0.532 + curr.rightHandXOff - (prefersReducedMotion ? 0 : Math.cos(t * 1.1) * 0.008)
    }
  })

  return (
    <group ref={rootGroupRef} position={[0, 0.75, 0]} scale={[1.28, 1.28, 1.28]}>
      {/* ─── BODY (TEARDROP TORSO) ─── */}
      <group ref={bodyRef} position={[0, -0.44, 0]}>
        <mesh
          geometry={nodes.Body.geometry}
          material={obsidianMat}
          castShadow
          receiveShadow
        />
      </group>

      {/* ─── HEAD (WITH VISIBLE SPACE / GAP BETWEEN NECK AND BODY) ─── */}
      <group ref={headRef} position={[0, 0.62, 0]}>
        <mesh
          geometry={nodes.Head.geometry}
          material={obsidianMat}
          castShadow
          receiveShadow
        />

        {/* ─── LEFT EYE: Glowing White Capsule & Adaptive Obsidian Eyelids ─── */}
        <group ref={leftEyeGroupRef} position={[-0.115, 0.008, 0.408]} rotation={[0.04, -0.06, -0.12]}>
          <mesh ref={leftEyeMeshRef} geometry={eyeCoreGeom} material={eyeCoreMat} />
          {/* Upper Eyelid Cover (Glossy Obsidian) */}
          <mesh
            ref={leftUpperLidRef}
            position={[0, 0.065, 0.012]}
            geometry={eyelidGeom}
            material={obsidianMat}
            visible={false}
          />
          {/* Lower Eyelid Cover (Glossy Obsidian) */}
          <mesh
            ref={leftLowerLidRef}
            position={[0, -0.065, 0.012]}
            geometry={eyelidGeom}
            material={obsidianMat}
            visible={false}
          />
        </group>

        {/* ─── RIGHT EYE: Glowing White Capsule & Adaptive Obsidian Eyelids ─── */}
        <group ref={rightEyeGroupRef} position={[0.115, 0.008, 0.408]} rotation={[0.04, 0.06, 0.12]}>
          <mesh ref={rightEyeMeshRef} geometry={eyeCoreGeom} material={eyeCoreMat} />
          {/* Upper Eyelid Cover (Glossy Obsidian) */}
          <mesh
            ref={rightUpperLidRef}
            position={[0, 0.065, 0.012]}
            geometry={eyelidGeom}
            material={obsidianMat}
            visible={false}
          />
          {/* Lower Eyelid Cover (Glossy Obsidian) */}
          <mesh
            ref={rightLowerLidRef}
            position={[0, -0.065, 0.012]}
            geometry={eyelidGeom}
            material={obsidianMat}
            visible={false}
          />
        </group>
      </group>

      {/* ─── LEFT PEARL HAND ─── */}
      <group ref={leftHandRef} position={[-0.572, -0.462, 0.069]}>
        <mesh
          geometry={nodes.LeftHand.geometry}
          material={pearlHandMat}
          castShadow
          receiveShadow
        />
      </group>

      {/* ─── RIGHT PEARL HAND ─── */}
      <group ref={rightHandRef} position={[0.532, -0.464, 0.069]}>
        <mesh
          geometry={nodes.RightHand.geometry}
          material={pearlHandMat}
          castShadow
          receiveShadow
        />
      </group>
    </group>
  )
}

useGLTF.preload('/osmoo_character.glb')

// ─── PERSISTENT CANVAS CONTAINER OVERLAY ──────────────────────────────────────
export interface PersistentCompanionSceneProps {
  currentPage: PageRoute
  expression?: CompanionExpression
}

export function PersistentCompanionScene({ currentPage, expression = 'neutral' }: PersistentCompanionSceneProps) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      setPointer({ x, y })
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-20 overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 40 }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        className="w-full h-full pointer-events-none"
        style={{ pointerEvents: 'none' }}
      >
        {/* Studio Environment Map for metallic-obsidian IBL reflections */}
        <StudioEnvironment />

        {/* Ambient illumination ensuring deep blacks without total pitch crushing */}
        <ambientLight intensity={0.32} />

        {/* Primary Key Light from upper-left — creates sharp curved specular highlights on head & torso */}
        <directionalLight
          position={[-3.8, 3.5, 4.0]}
          intensity={5.4}
          color="#ffffff"
        />

        {/* Studio fill light from right — softly illuminates pearl hands & right flank */}
        <directionalLight
          position={[4.0, 1.6, 2.8]}
          intensity={1.8}
          color="#9aa0be"
        />

        {/* Upper rim / silhouette kicker — sculpts top crown of the head and shoulders */}
        <directionalLight
          position={[0.4, 4.2, -2.6]}
          intensity={2.6}
          color="#dbe0f8"
        />

        {/* Lower rim kicker — outlines bottom curvature of torso and floating hands against dark page */}
        <directionalLight
          position={[-1.2, -2.8, -2.8]}
          intensity={1.8}
          color="#8b90b6"
        />

        {/* Persistent Traveling 3D Companion */}
        <ActiveCompanion currentPage={currentPage} pointer={pointer} expression={expression} />
      </Canvas>
    </div>
  )
}
