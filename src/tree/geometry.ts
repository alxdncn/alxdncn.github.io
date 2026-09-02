import { BufferGeometry, Float32BufferAttribute, MathUtils, Vector3 } from 'three'
import type { TreeEngine } from './TreeEngine'
import type { TreeSpecies } from './TreeSpecies'

const TIP_RADIUS = 0.025
const MAX_RADIUS = 0.36
const UP = new Vector3(0, 1, 0)

function branchRadii(engine: TreeEngine, species: TreeSpecies) {
  const terminalWeights = engine.nodes.map(() => 0)
  for (let index = engine.nodes.length - 1; index >= 0; index -= 1) {
    const node = engine.nodes[index]
    terminalWeights[index] =
      node.children.length === 0
        ? 1
        : node.children.reduce((total, childIndex) => total + terminalWeights[childIndex], 0)
  }

  const thickness = species.morphology.thickeningRate
  const radii = terminalWeights.map((weight, index) => {
    const node = engine.nodes[index]
    const along = node.sectionCount > 0 ? node.sectionIndex / node.sectionCount : 0
    const taper = 1 - node.taper * Math.pow(along, 1.12) * 0.26
    const radius = Math.min(
      MAX_RADIUS * thickness,
      TIP_RADIUS * thickness * Math.pow(Math.max(1, weight), 0.47),
    )
    return radius * taper * (node.children.length === 0 && index > 0 ? 0.24 : 1)
  })

  const root = engine.nodes[0]
  const thickestChild = root.children.reduce(
    (thickest, childIndex) => Math.max(thickest, radii[childIndex]),
    0,
  )
  radii[0] = Math.min(
    MAX_RADIUS * thickness * 1.24,
    Math.max(radii[0], thickestChild * 1.32),
  )
  return radii
}

function setGrowthAttributes(
  geometry: BufferGeometry,
  origins: number[],
  starts: number[],
  ends: number[],
) {
  geometry.setAttribute('growthOrigin', new Float32BufferAttribute(origins, 3))
  geometry.setAttribute('growthStart', new Float32BufferAttribute(starts, 1))
  geometry.setAttribute('growthEnd', new Float32BufferAttribute(ends, 1))
}

/** Build the complete wood mesh once; the shader reveals it by section time. */
export function buildBranchGeometry(engine: TreeEngine, species: TreeSpecies) {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const growthOrigins: number[] = []
  const growthStarts: number[] = []
  const growthEnds: number[] = []
  const radii = branchRadii(engine, species)
  const { meshSides } = engine.config

  for (let nodeIndex = 1; nodeIndex < engine.nodes.length; nodeIndex += 1) {
    const node = engine.nodes[nodeIndex]
    if (node.parent === null) continue
    const parent = engine.nodes[node.parent]
    const isLateralBase = node.lateral && node.sectionIndex === 1
    const startRadius = isLateralBase
      ? Math.min(radii[node.parent] * 0.72, Math.max(radii[nodeIndex] * 1.22, TIP_RADIUS))
      : radii[node.parent]
    const endRadius = radii[nodeIndex]
    const startRing = isLateralBase ? node.radials : parent.radials
    const startScale = isLateralBase ? node.ringScale : parent.ringScale
    const startV = parent.depth * 0.68
    const endV = startV + 0.68
    const baseVertex = positions.length / 3
    const baseGrowthDuration = Math.max(0.035, (node.growthEnd - node.growthStart) * 0.16)

    // Duplicate side zero at U=1 so bark does not interpolate across the seam.
    for (let side = 0; side <= meshSides; side += 1) {
      const ringIndex = side % meshSides
      const start = parent.position
        .clone()
        .addScaledVector(startRing[ringIndex], startRadius * startScale[ringIndex])
      const end = node.position
        .clone()
        .addScaledVector(node.radials[ringIndex], endRadius * node.ringScale[ringIndex])

      positions.push(start.x, start.y, start.z, end.x, end.y, end.z)
      const u = side / meshSides
      uvs.push(u, startV, u, endV)

      // The base opens like a bud; the end ring travels continuously from the
      // attachment to its final center, leaving a naturally tapered frontier.
      growthOrigins.push(
        parent.position.x,
        parent.position.y,
        parent.position.z,
        parent.position.x,
        parent.position.y,
        parent.position.z,
      )
      growthStarts.push(node.growthStart, node.growthStart)
      growthEnds.push(node.growthStart + baseGrowthDuration, node.growthEnd)
    }

    for (let side = 0; side < meshSides; side += 1) {
      const startA = baseVertex + side * 2
      const endA = startA + 1
      const startB = startA + 2
      const endB = startA + 3
      indices.push(startA, endA, startB, startB, endA, endB)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  setGrowthAttributes(geometry, growthOrigins, growthStarts, growthEnds)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

function appendLeafQuad(
  positions: number[],
  uvs: number[],
  indices: number[],
  growthOrigins: number[],
  growthStarts: number[],
  growthEnds: number[],
  center: Vector3,
  widthAxis: Vector3,
  heightAxis: Vector3,
  width: number,
  height: number,
  growthStart: number,
  growthEnd: number,
) {
  const halfWidth = widthAxis.clone().multiplyScalar(width)
  const halfHeight = heightAxis.clone().multiplyScalar(height)
  const baseVertex = positions.length / 3
  const corners = [
    center.clone().sub(halfWidth).sub(halfHeight),
    center.clone().add(halfWidth).sub(halfHeight),
    center.clone().add(halfWidth).add(halfHeight),
    center.clone().sub(halfWidth).add(halfHeight),
  ]
  for (const corner of corners) {
    positions.push(corner.x, corner.y, corner.z)
    growthOrigins.push(center.x, center.y, center.z)
    growthStarts.push(growthStart)
    growthEnds.push(growthEnd)
  }
  uvs.push(0, 0, 1, 0, 1, 1, 0, 1)
  indices.push(baseVertex, baseVertex + 1, baseVertex + 2, baseVertex, baseVertex + 2, baseVertex + 3)
}

/** Crossed broadleaf cards, restricted to the outer sections of final twigs. */
export function buildLeafGeometry(engine: TreeEngine, species: TreeSpecies) {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const growthOrigins: number[] = []
  const growthStarts: number[] = []
  const growthEnds: number[] = []

  if (species.foliage.form === 'none') return new BufferGeometry()
  const terminalLevel = engine.config.branchOrders.length - 1

  for (let nodeIndex = 1; nodeIndex < engine.nodes.length; nodeIndex += 1) {
    const node = engine.nodes[nodeIndex]
    if (
      node.branchLevel !== terminalLevel ||
      node.sectionIndex / Math.max(1, node.sectionCount) < 0.55 ||
      node.depth < species.foliage.minimumBranchDepth ||
      node.parent === null
    ) continue

    const parent = engine.nodes[node.parent]
    for (let cluster = 0; cluster < species.foliage.leavesPerTip; cluster += 1) {
      const seed = (node.leafSeed * 977 + cluster * 0.381966) % 1
      const along = MathUtils.clamp(0.5 + cluster * 0.24 + (seed - 0.5) * 0.12, 0.42, 0.88)
      const center = parent.position.clone().lerp(node.position, along)
      const radialIndex = Math.floor(seed * node.radials.length) % node.radials.length
      const radial = node.radials[radialIndex].clone().normalize()
      const tangent = new Vector3().crossVectors(node.direction, radial).normalize()
      center.addScaledVector(radial, 0.045 + cluster * 0.032)

      const heightAxis = node.direction
        .clone()
        .multiplyScalar(0.72)
        .addScaledVector(UP, 0.28)
        .addScaledVector(tangent, (seed - 0.5) * 0.22)
        .normalize()
      const width = species.foliage.width * (0.76 + seed * 0.34)
      const height = species.foliage.height * (0.8 + ((seed * 7.13) % 1) * 0.28)
      const growthStart =
        MathUtils.lerp(parent.growthEnd, node.growthEnd, along) +
        engine.config.leafGrowthDelay * (0.55 + seed * 1.05) +
        cluster * 0.16
      const growthEnd =
        growthStart + engine.config.leafGrowthDuration * (0.76 + ((seed * 3.71) % 1) * 0.42)

      // A perpendicular pair reads as one leafy cluster from the fixed hero
      // camera while remaining a single merged, alpha-tested draw call.
      appendLeafQuad(
        positions,
        uvs,
        indices,
        growthOrigins,
        growthStarts,
        growthEnds,
        center,
        radial,
        heightAxis,
        width,
        height,
        growthStart,
        growthEnd,
      )
      appendLeafQuad(
        positions,
        uvs,
        indices,
        growthOrigins,
        growthStarts,
        growthEnds,
        center,
        tangent,
        heightAxis,
        width,
        height,
        growthStart + 0.04,
        growthEnd + 0.04,
      )
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  setGrowthAttributes(geometry, growthOrigins, growthStarts, growthEnds)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}
