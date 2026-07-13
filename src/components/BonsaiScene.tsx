import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { ACESFilmicToneMapping, PerspectiveCamera, RepeatWrapping, SRGBColorSpace } from 'three'
import { ProceduralTree } from './ProceduralTree'
import type { TreeStats } from '../tree/TreeEngine'

interface BonsaiSceneProps {
  seed: number
  branching: number
  rootBranching: number
  speed: number
  paused: boolean
  onStats: (stats: TreeStats) => void
}

function Ground() {
  const soil = useTexture('/textures/Soil1.jpg')
  soil.colorSpace = SRGBColorSpace
  soil.wrapS = soil.wrapT = RepeatWrapping
  soil.repeat.set(2.5, 2.5)

  return (
    <group>
      <mesh position-y={-0.11} receiveShadow>
        <cylinderGeometry args={[3.15, 3.35, 0.22, 64]} />
        <meshStandardMaterial map={soil} color="#6e5943" roughness={1} />
      </mesh>
      <mesh position-y={-0.18} receiveShadow>
        <cylinderGeometry args={[3.45, 3.05, 0.32, 64]} />
        <meshStandardMaterial color="#35372f" roughness={0.76} metalness={0.08} />
      </mesh>
    </group>
  )
}

function ResponsiveCamera() {
  const { camera, size } = useThree()
  const isMobile = size.width <= 700

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return

    if (isMobile) {
      camera.position.set(22, 5, 31)
      camera.fov = 48
      camera.lookAt(0, 5, 0)
    } else {
      camera.position.set(18, 5, 24)
      camera.fov = 42
      camera.lookAt(0, 5, 0)
    }
    camera.updateProjectionMatrix()
  }, [camera, isMobile])

  return null
}

function SceneContents(props: BonsaiSceneProps) {
  return (
    <>
      <ResponsiveCamera />
      <color attach="background" args={['#e8eadf']} />
      <fog attach="fog" args={['#e8eadf', 12, 292]} />
      <hemisphereLight args={['#f7f3df', '#4b5548', 2.1]} />
      <directionalLight
        position={[5, 11, 7]}
        intensity={3.4}
        color="#fff1cf"
        castShadow
        shadow-mapSize={[2048, 2048]}
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
  return (
    <Canvas
      shadows="basic"
      dpr={[1, 2]}
      camera={{ position: [18, 14, 24], fov: 42, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, toneMapping: ACESFilmicToneMapping }}
    >
      <Suspense fallback={null}>
        <SceneContents {...props} />
      </Suspense>
    </Canvas>
  )
}
