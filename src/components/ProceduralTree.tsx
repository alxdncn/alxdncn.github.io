import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import {
  DoubleSide,
  MeshStandardMaterial,
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

interface GrowthUniform {
  value: number
}

type StandardShader = Parameters<MeshStandardMaterial['onBeforeCompile']>[0]

function installGrowthShader(shader: StandardShader, growthTime: GrowthUniform, eased: boolean) {
  shader.uniforms.treeGrowthTime = growthTime
  shader.vertexShader = `
    attribute vec3 growthOrigin;
    attribute float growthStart;
    attribute float growthEnd;
    uniform float treeGrowthTime;
  ${shader.vertexShader}`.replace(
    '#include <begin_vertex>',
    `#include <begin_vertex>
    float treeGrowthDuration = max(growthEnd - growthStart, 0.0001);
    float treeGrowthProgress = clamp(
      (treeGrowthTime - growthStart) / treeGrowthDuration,
      0.0,
      1.0
    );
    ${eased ? 'treeGrowthProgress = treeGrowthProgress * treeGrowthProgress * (3.0 - 2.0 * treeGrowthProgress);' : ''}
    transformed = mix(growthOrigin, transformed, treeGrowthProgress);`,
  )
}

function BarkMaterial({
  mapUrl,
  normalUrl,
  color,
  growthTime,
}: {
  mapUrl: string
  normalUrl: string
  color: string
  growthTime: GrowthUniform
}) {
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
      onBeforeCompile={(shader) => installGrowthShader(shader, growthTime, false)}
      customProgramCacheKey={() => 'tree-growth-wood-v1'}
    />
  )
}

function LeafMaterial({
  textureUrl,
  color,
  growthTime,
}: {
  textureUrl: string
  color: string
  growthTime: GrowthUniform
}) {
  const leaves = useTexture(textureUrl)
  const { gl } = useThree()

  useEffect(() => {
    leaves.colorSpace = SRGBColorSpace
    leaves.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    leaves.needsUpdate = true
  }, [gl, leaves])

  return (
    <meshStandardMaterial
      map={leaves}
      alphaTest={0.38}
      alphaToCoverage
      color={color}
      roughness={0.86}
      metalness={0}
      side={DoubleSide}
      onBeforeCompile={(shader) => installGrowthShader(shader, growthTime, true)}
      customProgramCacheKey={() => 'tree-growth-leaves-v1'}
    />
  )
}

function GrowthFallbackMaterial({
  color,
  growthTime,
  leaves = false,
}: {
  color: string
  growthTime: GrowthUniform
  leaves?: boolean
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={leaves ? 0.86 : 0.92}
      side={leaves ? DoubleSide : undefined}
      onBeforeCompile={(shader) => installGrowthShader(shader, growthTime, leaves)}
      customProgramCacheKey={() => `tree-growth-fallback-${leaves ? 'leaves' : 'wood'}-v1`}
    />
  )
}

export function ProceduralTree({
  seed,
  branching,
  rootBranching,
  initialGrowthSteps,
  speed,
  paused,
  onStats,
}: ProceduralTreeProps) {
  const tree = useMemo(
    () => new Tree(legacyBonsaiSpecies, seed, branching, rootBranching, initialGrowthSteps),
    [branching, initialGrowthSteps, rootBranching, seed],
  )
  const { species } = tree
  const branchGeometry = useMemo(
    () => buildBranchGeometry(tree.canopy, species),
    [species, tree],
  )
  const leafGeometry = useMemo(
    () => buildLeafGeometry(tree.canopy, species),
    [species, tree],
  )
  const branchGrowthTime = useMemo<GrowthUniform>(
    () => ({ value: tree.canopy.growthTime }),
    [tree],
  )
  const leafGrowthTime = useMemo<GrowthUniform>(
    () => ({ value: tree.canopy.growthTime }),
    [tree],
  )
  const visible = useRef(true)
  const reducedMotion = useRef(false)
  const lastStatsUpdate = useRef(0)
  const elapsedTime = useRef(0)
  const { gl, invalidate } = useThree()

  useEffect(
    () => () => {
      branchGeometry.dispose()
      leafGeometry.dispose()
    },
    [branchGeometry, leafGeometry],
  )

  useEffect(() => {
    onStats(tree.stats)
    invalidate()
  }, [invalidate, onStats, tree])

  useEffect(() => {
    const canvas = gl.domElement
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry?.isIntersecting ?? true
        if (visible.current && !paused && tree.stats.growing) invalidate()
      },
      { rootMargin: '120px' },
    )
    observer.observe(canvas)

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyMotionPreference = () => {
      reducedMotion.current = motionPreference.matches
      if (reducedMotion.current) {
        tree.canopy.completeGrowth()
        tree.roots.completeGrowth()
        branchGrowthTime.value = tree.canopy.growthTime
        leafGrowthTime.value = tree.canopy.growthTime
        onStats(tree.stats)
      }
      invalidate()
    }
    applyMotionPreference()
    motionPreference.addEventListener?.('change', applyMotionPreference)

    return () => {
      observer.disconnect()
      motionPreference.removeEventListener?.('change', applyMotionPreference)
    }
  }, [branchGrowthTime, gl, invalidate, leafGrowthTime, onStats, paused, tree])

  useEffect(() => {
    if (!paused && visible.current && tree.stats.growing) invalidate()
  }, [invalidate, paused, tree])

  useFrame((_, delta) => {
    elapsedTime.current += delta
    const changed =
      !paused &&
      visible.current &&
      !reducedMotion.current &&
      tree.update(Math.min(delta, 0.05), speed)

    branchGrowthTime.value = tree.canopy.growthTime
    leafGrowthTime.value = tree.canopy.growthTime

    if (changed && elapsedTime.current - lastStatsUpdate.current > 0.16) {
      lastStatsUpdate.current = elapsedTime.current
      onStats(tree.stats)
    }
    if (changed && tree.stats.growing) invalidate()
  })

  return (
    <group>
      <mesh geometry={branchGeometry} castShadow receiveShadow>
        <Suspense
          fallback={
            <GrowthFallbackMaterial
              color="#4f3526"
              growthTime={branchGrowthTime}
            />
          }
        >
          <BarkMaterial
            mapUrl={species.appearance.barkTextureUrl}
            normalUrl={species.appearance.barkNormalUrl}
            color={species.appearance.barkColor}
            growthTime={branchGrowthTime}
          />
        </Suspense>
      </mesh>
      <mesh geometry={leafGeometry} castShadow={false}>
        <Suspense
          fallback={
            <GrowthFallbackMaterial
              color={species.appearance.foliageColor}
              growthTime={leafGrowthTime}
              leaves
            />
          }
        >
          <LeafMaterial
            textureUrl={species.appearance.foliageTextureUrl}
            color={species.appearance.foliageColor}
            growthTime={leafGrowthTime}
          />
        </Suspense>
      </mesh>
    </group>
  )
}
