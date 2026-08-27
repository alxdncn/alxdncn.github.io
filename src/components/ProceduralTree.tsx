import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import {
  DoubleSide,
  Group,
  Mesh,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
} from 'three'
import { buildBranchGeometry, buildLeafGeometry } from '../tree/geometry'
import { Tree } from '../tree/Tree'
import type { TreeStats } from '../tree/TreeEngine'
import { legacyBonsaiSpecies } from '../tree/species/LegacyBonsaiSpecies'

interface ProceduralTreeProps {
  seed: number
  branching: number
  rootBranching: number
  initialGrowthSteps: number
  speed: number
  paused: boolean
  onStats: (stats: TreeStats) => void
}

function BarkMaterial({ mapUrl, normalUrl, color }: { mapUrl: string; normalUrl: string; color: string }) {
  const [bark, barkNormal] = useTexture([mapUrl, normalUrl])

  useEffect(() => {
    bark.colorSpace = SRGBColorSpace
    bark.wrapS = bark.wrapT = RepeatWrapping
    bark.needsUpdate = true
    barkNormal.wrapS = barkNormal.wrapT = RepeatWrapping
    barkNormal.needsUpdate = true
  }, [bark, barkNormal])

  return (
    <meshStandardMaterial
      map={bark}
      normalMap={barkNormal}
      normalScale={new Vector2(0.62, 0.62)}
      color={color}
      roughness={0.92}
      metalness={0}
    />
  )
}

function LeafMaterial({ textureUrl, color }: { textureUrl: string; color: string }) {
  const leaves = useTexture(textureUrl)

  useEffect(() => {
    leaves.colorSpace = SRGBColorSpace
    leaves.needsUpdate = true
  }, [leaves])

  return (
    <meshStandardMaterial
      map={leaves}
      alphaTest={0.42}
      color={color}
      roughness={0.86}
      metalness={0}
      side={DoubleSide}
    />
  )
}

export function ProceduralTree({ seed, branching, rootBranching, initialGrowthSteps, speed, paused, onStats }: ProceduralTreeProps) {
  const tree = useMemo(
    () => new Tree(legacyBonsaiSpecies, seed, branching, rootBranching, initialGrowthSteps),
    [branching, initialGrowthSteps, rootBranching, seed],
  )
  const { species } = tree
  const branchMesh = useRef<Mesh>(null)
  const leafMesh = useRef<Mesh>(null)
  const leafGroup = useRef<Group>(null)
  const firstFrame = useRef(true)
  const geometryDirty = useRef(true)
  const lastGeometryUpdate = useRef(Number.NEGATIVE_INFINITY)
  const lastStatsUpdate = useRef(0)
  const elapsedTime = useRef(0)

  useEffect(() => () => {
    branchMesh.current?.geometry.dispose()
    leafMesh.current?.geometry.dispose()
  }, [])

  useFrame((_, delta) => {
    elapsedTime.current += delta
    const changed = !paused && tree.update(Math.min(delta, 0.05), speed)
    if (changed) geometryDirty.current = true
    if (
      geometryDirty.current &&
      (firstFrame.current || elapsedTime.current - lastGeometryUpdate.current >= 1 / 30) &&
      branchMesh.current &&
      leafMesh.current
    ) {
      const nextBranches = buildBranchGeometry(tree.canopy, species)
      const nextLeaves = buildLeafGeometry(tree.canopy, species)
      branchMesh.current.geometry.dispose()
      leafMesh.current.geometry.dispose()
      branchMesh.current.geometry = nextBranches
      leafMesh.current.geometry = nextLeaves
      firstFrame.current = false
      geometryDirty.current = false
      lastGeometryUpdate.current = elapsedTime.current
    }

    if (leafGroup.current) {
      leafGroup.current.rotation.z = Math.sin(elapsedTime.current * 0.72) * 0.004
      leafGroup.current.rotation.x = Math.sin(elapsedTime.current * 0.47 + 1.4) * 0.0025
    }

    if (changed && elapsedTime.current - lastStatsUpdate.current > 0.16) {
      lastStatsUpdate.current = elapsedTime.current
      onStats(tree.stats)
    }
  })

  return (
    <group>
      <mesh ref={branchMesh} castShadow receiveShadow>
        <bufferGeometry />
        <Suspense fallback={<meshStandardMaterial color="#4f3526" roughness={0.92} />}>
          <BarkMaterial
            mapUrl={species.appearance.barkTextureUrl}
            normalUrl={species.appearance.barkNormalUrl}
            color={species.appearance.barkColor}
          />
        </Suspense>
      </mesh>
      <group ref={leafGroup}>
        <mesh ref={leafMesh} castShadow>
          <bufferGeometry />
          <Suspense fallback={<meshStandardMaterial color={species.appearance.foliageColor} roughness={0.86} side={DoubleSide} />}>
            <LeafMaterial textureUrl={species.appearance.foliageTextureUrl} color={species.appearance.foliageColor} />
          </Suspense>
        </mesh>
      </group>
    </group>
  )
}
