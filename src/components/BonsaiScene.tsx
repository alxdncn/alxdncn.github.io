import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { ACESFilmicToneMapping, PerspectiveCamera, RepeatWrapping, SRGBColorSpace } from 'three'
import { ProceduralTree } from './ProceduralTree'
import type { TreeStats } from '../tree/TreeEngine'

interface BonsaiSceneProps {
  seed: number
  branching: number
  rootBranching: number
  initialGrowthSteps: number
  speed: number
  paused: boolean
  onStats: (stats: TreeStats) => void
}

interface FallbackBranch {
  startX: number
  startY: number
  endX: number
  endY: number
  width: number
}

interface FallbackLeaf {
  x: number
  y: number
  size: number
  rotation: number
  shade: number
}

function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function makeFallbackTree() {
  const random = seededRandom(7319)
  const branches: FallbackBranch[] = []
  const leaves: FallbackLeaf[] = []

  function grow(startX: number, startY: number, length: number, angle: number, depth: number) {
    const endX = startX + Math.cos(angle) * length
    const endY = startY + Math.sin(angle) * length
    branches.push({ startX, startY, endX, endY, width: Math.max(0.0035, depth * 0.0028) })

    if (depth === 0) {
      for (let index = 0; index < 4; index += 1) {
        leaves.push({
          x: endX + (random() - 0.5) * 0.045,
          y: endY + (random() - 0.5) * 0.035,
          size: 0.018 + random() * 0.012,
          rotation: random() * Math.PI,
          shade: Math.floor(random() * 3),
        })
      }
      return
    }

    const childCount = depth > 3 || random() > 0.34 ? 2 : 3
    const spreads = childCount === 2 ? [-0.39, 0.39] : [-0.48, 0.02, 0.48]
    for (const spread of spreads) {
      grow(
        endX,
        endY,
        length * (0.64 + random() * 0.1),
        angle + spread + (random() - 0.5) * 0.17,
        depth - 1,
      )
    }
  }

  grow(0, 0, 0.235, -Math.PI / 2, 5)
  return { branches, leaves }
}

const fallbackTree = makeFallbackTree()

function canRenderWebGL() {
  if (typeof document === 'undefined') return false
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('fallback-tree')) return false

  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function FallbackTreeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const barkImage = new Image()
    const soilImage = new Image()
    let barkReady = false
    let soilReady = false
    let active = true

    const render = () => {
      const bounds = canvas.getBoundingClientRect()
      if (bounds.width <= 0 || bounds.height <= 0) return

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(bounds.width * pixelRatio)
      canvas.height = Math.round(bounds.height * pixelRatio)

      const context = canvas.getContext('2d')
      if (!context) return

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, bounds.width, bounds.height)

      const baseX = bounds.width * 0.52
      const baseY = bounds.height * 0.77
      const scale = Math.min(bounds.height * 0.82, bounds.width * 0.72)

      context.save()
      context.fillStyle = 'rgba(37, 42, 35, .17)'
      context.beginPath()
      context.ellipse(baseX, baseY + 10, bounds.width * 0.19, bounds.height * 0.028, 0, 0, Math.PI * 2)
      context.fill()

      context.fillStyle = '#35372f'
      context.beginPath()
      context.ellipse(baseX, baseY + 3, bounds.width * 0.185, bounds.height * 0.03, 0, 0, Math.PI * 2)
      context.fill()

      context.fillStyle = '#493424'
      context.beginPath()
      context.ellipse(baseX, baseY, bounds.width * 0.17, bounds.height * 0.023, 0, 0, Math.PI * 2)
      context.fill()

      const soilPattern = soilReady ? context.createPattern(soilImage, 'repeat') : null
      if (soilPattern) {
        context.save()
        context.globalAlpha = 0.48
        context.fillStyle = soilPattern
        context.beginPath()
        context.ellipse(baseX, baseY, bounds.width * 0.17, bounds.height * 0.023, 0, 0, Math.PI * 2)
        context.fill()
        context.restore()
      }

      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = '#4f3526'
      for (const branch of fallbackTree.branches) {
        context.lineWidth = Math.max(1.15, branch.width * scale)
        context.beginPath()
        context.moveTo(baseX + branch.startX * scale, baseY + branch.startY * scale)
        context.lineTo(baseX + branch.endX * scale, baseY + branch.endY * scale)
        context.stroke()
      }

      const barkPattern = barkReady ? context.createPattern(barkImage, 'repeat') : null
      if (barkPattern) {
        context.save()
        context.globalAlpha = 0.58
        context.strokeStyle = barkPattern
        for (const branch of fallbackTree.branches) {
          context.lineWidth = Math.max(0.75, branch.width * scale * 0.72)
          context.beginPath()
          context.moveTo(baseX + branch.startX * scale, baseY + branch.startY * scale)
          context.lineTo(baseX + branch.endX * scale, baseY + branch.endY * scale)
          context.stroke()
        }
        context.restore()
      }

      const leafColors = ['#66845f', '#78966c', '#536b50']
      for (const leaf of fallbackTree.leaves) {
        const x = baseX + leaf.x * scale
        const y = baseY + leaf.y * scale
        const size = leaf.size * scale
        context.save()
        context.translate(x, y)
        context.rotate(leaf.rotation)
        context.fillStyle = leafColors[leaf.shade]
        context.beginPath()
        context.ellipse(0, 0, size, size * 0.46, 0, 0, Math.PI * 2)
        context.fill()
        context.restore()
      }
      context.restore()
    }

    barkImage.onload = () => {
      if (!active) return
      barkReady = true
      render()
    }
    soilImage.onload = () => {
      if (!active) return
      soilReady = true
      render()
    }
    barkImage.src = '/textures/Bark1.jpeg'
    soilImage.src = '/textures/Soil1.jpg'

    const resizeObserver = new ResizeObserver(render)
    resizeObserver.observe(canvas)
    render()
    return () => {
      active = false
      resizeObserver.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="bonsai-fallback" aria-hidden="true" />
}

function SoilMaterial() {
  const soil = useTexture('/textures/Soil1.jpg')

  useEffect(() => {
    soil.colorSpace = SRGBColorSpace
    soil.wrapS = soil.wrapT = RepeatWrapping
    soil.repeat.set(2.5, 2.5)
    soil.needsUpdate = true
  }, [soil])

  return <meshStandardMaterial map={soil} color="#6e5943" roughness={1} />
}

function Ground() {
  return (
    <group>
      <mesh position-y={-0.11} receiveShadow>
        <cylinderGeometry args={[3.15, 3.35, 0.22, 48]} />
        <Suspense fallback={<meshStandardMaterial color="#493424" roughness={1} />}>
          <SoilMaterial />
        </Suspense>
      </mesh>
      <mesh position-y={-0.18} receiveShadow>
        <cylinderGeometry args={[3.45, 3.05, 0.32, 48]} />
        <meshStandardMaterial color="#35372f" roughness={0.76} metalness={0.08} />
      </mesh>
    </group>
  )
}

function FixedCamera() {
  const { camera } = useThree()

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return

    camera.position.set(18, 5, 24)
    camera.fov = 42
    camera.lookAt(0, 5, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  return null
}

function SceneContents(props: BonsaiSceneProps) {
  return (
    <>
      <FixedCamera />
      <color attach="background" args={['#e8eadf']} />
      <hemisphereLight args={['#f7f3df', '#4b5548', 2.1]} />
      <directionalLight
        position={[5, 11, 7]}
        intensity={3.4}
        color="#fff1cf"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.1}
        shadow-camera-far={24}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={11}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-7, 5, -4]} intensity={1.05} color="#b9d2ca" />
      <ProceduralTree {...props} />
      <Ground />
    </>
  )
}

export function BonsaiScene(props: BonsaiSceneProps) {
  const [webGLAvailable] = useState(canRenderWebGL)

  if (!webGLAvailable) return <FallbackTreeCanvas />

  return (
    <Canvas
      shadows="basic"
      dpr={[1, 1.5]}
      camera={{ position: [18, 14, 24], fov: 42, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, toneMapping: ACESFilmicToneMapping }}
    >
      <SceneContents {...props} />
    </Canvas>
  )
}
