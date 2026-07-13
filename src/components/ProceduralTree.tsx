import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
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
  speed: number
  paused: boolean
  onStats: (stats: TreeStats) => void
}

export function ProceduralTree({ seed, branching, rootBranching, speed, paused, onStats }: ProceduralTreeProps) {
  const tree = useMemo(
    () => new Tree(legacyBonsaiSpecies, seed, branching, rootBranching),
    [branching, rootBranching, seed],
  )
  const { species } = tree
  const branchMesh = useRef<Mesh>(null)
  const rootMesh = useRef<Mesh>(null)
  const leafMesh = useRef<Mesh>(null)
  const leafGroup = useRef<Group>(null)
  const firstFrame = useRef(true)
  const lastStatsUpdate = useRef(0)
  const elapsedTime = useRef(0)
  const { gl } = useThree()
  const [bark, barkNormal, leaves] = useTexture([
    species.appearance.barkTextureUrl,
    species.appearance.barkNormalUrl,
    species.appearance.foliageTextureUrl,
  ])

  useEffect(() => {
    bark.colorSpace = SRGBColorSpace
    bark.wrapS = bark.wrapT = RepeatWrapping
    bark.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    bark.needsUpdate = true

    barkNormal.wrapS = barkNormal.wrapT = RepeatWrapping
    barkNormal.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    barkNormal.needsUpdate = true

    leaves.colorSpace = SRGBColorSpace
    leaves.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    leaves.needsUpdate = true
  }, [bark, barkNormal, gl, leaves])

  useEffect(() => () => {
    branchMesh.current?.geometry.dispose()
    rootMesh.current?.geometry.dispose()
    leafMesh.current?.geometry.dispose()
  }, [])

  useFrame((_, delta) => {
    elapsedTime.current += delta
    const changed = !paused && tree.update(Math.min(delta, 0.05), speed)
    if (
      (changed || firstFrame.current) &&
      branchMesh.current &&
      rootMesh.current &&
      leafMesh.current
    ) {
      const nextBranches = buildBranchGeometry(tree.canopy, species)
      const nextRoots = buildBranchGeometry(tree.roots, species)
      const nextLeaves = buildLeafGeometry(tree.canopy, species)
      branchMesh.current.geometry.dispose()
      rootMesh.current.geometry.dispose()
      leafMesh.current.geometry.dispose()
      branchMesh.current.geometry = nextBranches
      rootMesh.current.geometry = nextRoots
      leafMesh.current.geometry = nextLeaves
      firstFrame.current = false
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
        <meshStandardMaterial
          map={bark}
          normalMap={barkNormal}
          normalScale={new Vector2(0.62, 0.62)}
          color={species.appearance.barkColor}
          roughness={0.92}
          metalness={0}
        />
      </mesh>
      <mesh ref={rootMesh} castShadow receiveShadow>
        <bufferGeometry />
        <meshStandardMaterial
          map={bark}
          normalMap={barkNormal}
          normalScale={new Vector2(0.54, 0.54)}
          color={species.appearance.rootColor}
          roughness={0.96}
          metalness={0}
        />
      </mesh>
      <group ref={leafGroup}>
        <mesh ref={leafMesh} castShadow>
          <bufferGeometry />
          <meshStandardMaterial
            map={leaves}
            alphaTest={0.42}
            color={species.appearance.foliageColor}
            roughness={0.86}
            metalness={0}
            side={DoubleSide}
          />
        </mesh>
      </group>
    </group>
  )
}
