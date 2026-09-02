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
    const terminalScale = node.children.length === 0 && index > 0 ? 0.24 : 1
    const trunkScale =
      node.branchLevel === 0
        ? 1.1 * (1.12 + 0.28 * Math.pow(1 - along, 2.35))
        : 1
    return Math.min(
      MAX_RADIUS * thickness * 1.5,
      radius * taper * terminalScale * trunkScale,
    )
  })

  const root = engine.nodes[0]
  const thickestChild = root.children.reduce(
    (thickest, childIndex) => Math.max(thickest, radii[childIndex]),
    0,
  )
  radii[0] = Math.min(
    MAX_RADIUS * thickness * 1.628,
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

function appendBentLeafCard(
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
  bend: number,
  growthStart: number,
  growthEnd: number,
) {
  const halfWidth = widthAxis.clone().multiplyScalar(width)
  const halfHeight = heightAxis.clone().multiplyScalar(height)
  const bendAxis = new Vector3().crossVectors(widthAxis, heightAxis).normalize()
  const bottom = center.clone().sub(halfHeight)
  const middle = center.clone().addScaledVector(bendAxis, bend)
  const top = center.clone().add(halfHeight).addScaledVector(bendAxis, bend * 0.18)
  const baseVertex = positions.length / 3
  const vertices = [
    bottom.clone().sub(halfWidth),
    bottom.clone().add(halfWidth),
    middle.clone().sub(halfWidth),
    middle.clone().add(halfWidth),
    top.clone().sub(halfWidth),
    top.clone().add(halfWidth),
  ]
  for (const vertex of vertices) {
    positions.push(vertex.x, vertex.y, vertex.z)
    growthOrigins.push(center.x, center.y, center.z)
    growthStarts.push(growthStart)
    growthEnds.push(growthEnd)
  }
  uvs.push(0, 0, 1, 0, 0, 0.5, 1, 0.5, 0, 1, 1, 1)
  indices.push(
    baseVertex,
    baseVertex + 1,
    baseVertex + 2,
    baseVertex + 2,
    baseVertex + 1,
    baseVertex + 3,
    baseVertex + 2,
    baseVertex + 3,
    baseVertex + 4,
    baseVertex + 4,
    baseVertex + 3,
    baseVertex + 5,
  )
}

/** Small, bowed broadleaf sprays, restricted to the outer sections of final twigs. */
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
      node.sectionIndex / Math.max(1, node.sectionCount) < 0.3 ||
      node.depth < species.foliage.minimumBranchDepth ||
      node.parent === null
    ) continue

    const parent = engine.nodes[node.parent]
    for (let cluster = 0; cluster < species.foliage.leavesPerTip; cluster += 1) {
      const seed = (node.leafSeed * 977 + cluster * 0.381966) % 1
      const slot = (cluster + 0.5 + (seed - 0.5) * 0.56) / species.foliage.leavesPerTip
      const along = MathUtils.lerp(0.2, 0.96, MathUtils.clamp(slot, 0, 1))
      const center = parent.position.clone().lerp(node.position, along)
      const radialAngle = seed * Math.PI * 2 + cluster * 2.399963
      const radialBasis = node.radials[0].clone().normalize()
      const tangentBasis = new Vector3().crossVectors(node.direction, radialBasis).normalize()
      const radial = radialBasis
        .multiplyScalar(Math.cos(radialAngle))
        .addScaledVector(tangentBasis, Math.sin(radialAngle))
        .normalize()
      const tangent = new Vector3().crossVectors(node.direction, radial).normalize()
      center.addScaledVector(radial, 0.045 + (seed - 0.5) * 0.035)

      const heightAxis = node.direction
        .clone()
        .multiplyScalar(0.36)
        .addScaledVector(radial, 0.48 + seed * 0.16)
        .addScaledVector(UP, 0.12 + ((seed * 5.73) % 1) * 0.09)
        .normalize()
      const widthAxis = radial
        .clone()
        .addScaledVector(heightAxis, -radial.dot(heightAxis))
        .normalize()
      const crossAxis = new Vector3().crossVectors(heightAxis, widthAxis).normalize()
      const width = species.foliage.width * (0.72 + seed * 0.73)
      const height = species.foliage.height * (0.76 + ((seed * 7.13) % 1) * 0.715)
      const bend = width * (0.12 + ((seed * 11.31) % 1) * 0.12)
      const growthStart =
        MathUtils.lerp(parent.growthEnd, node.growthEnd, along) +
        engine.config.leafGrowthDelay * (0.55 + seed * 1.05) +
        cluster * 0.16
      const growthEnd =
        growthStart + engine.config.leafGrowthDuration * (0.76 + ((seed * 3.71) % 1) * 0.42)

      // The article's perpendicular pair keeps foliage readable from every
      // direction. Smaller, bowed cards add real normals and avoid a flat X.
      appendBentLeafCard(
        positions,
        uvs,
        indices,
        growthOrigins,
        growthStarts,
        growthEnds,
        center,
        widthAxis,
        heightAxis,
        width,
        height,
        bend,
        growthStart,
        growthEnd,
      )
      appendBentLeafCard(
        positions,
        uvs,
        indices,
        growthOrigins,
        growthStarts,
        growthEnds,
        center,
        crossAxis,
        heightAxis,
        width * 0.94,
        height * 0.96,
        -bend * 0.82,
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
