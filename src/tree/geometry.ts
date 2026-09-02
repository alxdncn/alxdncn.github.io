import { BufferGeometry, Float32BufferAttribute, MathUtils, Vector3 } from 'three'
import { easedProgress, type TreeEngine } from './TreeEngine'
import type { TreeSpecies } from './TreeSpecies'

const TIP_RADIUS = 0.026
const MAX_RADIUS = 0.34
const LEAF_GROWTH_START_AGE = 0.5
const LEAF_GROWTH_FULL_AGE = 3.75

function branchRadii(engine: TreeEngine, species: TreeSpecies) {
  const weights = engine.nodes.map(() => 0)
  const growth = engine.nodes.map((node) => easedProgress(node.progress))
  for (let index = engine.nodes.length - 1; index > 0; index -= 1) {
    const node = engine.nodes[index]
    const mostGrownChild = node.children.reduce(
      (largest, childIndex) => Math.max(largest, growth[childIndex]),
      0,
    )
    const terminalWeight = 1 - mostGrownChild
    weights[index] = terminalWeight + node.children.reduce(
      (total, childIndex) => total + weights[childIndex] * growth[childIndex],
      0,
    )
    const parent = engine.nodes[index].parent
    if (parent !== null) weights[parent] += weights[index] * growth[index]
  }
  weights[0] = Math.max(1, weights[0])
  const radii = weights.map((weight, index) => {
    const ageScale = MathUtils.smoothstep(engine.nodes[index].age, 0, 1.6)
    const thickness = species.morphology.thickeningRate
    return Math.min(MAX_RADIUS * thickness, TIP_RADIUS * thickness * Math.pow(Math.max(1, weight), 0.43)) * (0.35 + ageScale * 0.65)
  })

  // Pipe-model thickness alone can leave a young or sparsely branched tree
  // pinched where it enters the soil. Give the root collar a modest buttress
  // and derive it from its thickest child so the base is always the widest
  // part of the trunk, even early in the simulation.
  const root = engine.nodes[0]
  const thickestChild = root.children.reduce(
    (thickest, childIndex) => Math.max(thickest, radii[childIndex]),
    0,
  )
  radii[0] = Math.min(MAX_RADIUS * species.morphology.thickeningRate * 1.25, Math.max(radii[0], thickestChild * 1.35))

  return radii
}

export function buildBranchGeometry(engine: TreeEngine, species: TreeSpecies) {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const radii = branchRadii(engine, species)
  const { meshSides } = engine.config

  for (let nodeIndex = 1; nodeIndex < engine.nodes.length; nodeIndex += 1) {
    const node = engine.nodes[nodeIndex]
    if (node.parent === null || node.progress <= 0.001) continue
    const parent = engine.nodes[node.parent]
    const progress = easedProgress(node.progress)
    const endCenter = parent.position.clone().lerp(node.position, progress)
    const startV = parent.depth * 0.72
    const endV = startV + progress * 0.72
    const baseVertex = positions.length / 3

    // Duplicate side zero at U=1. This is the seam vertex the Unity mesh was
    // missing, so bark no longer interpolates backward across the closing face.
    for (let side = 0; side <= meshSides; side += 1) {
      const ringIndex = side % meshSides
      const startRadius = radii[node.parent] * parent.ringScale[ringIndex]
      const endRadius = radii[nodeIndex] * node.ringScale[ringIndex] * MathUtils.smoothstep(progress, 0, 0.35)
      const start = parent.position.clone().addScaledVector(parent.radials[ringIndex], startRadius)
      const end = endCenter.clone().addScaledVector(node.radials[ringIndex], endRadius)

      positions.push(start.x, start.y, start.z, end.x, end.y, end.z)
      const u = side / meshSides
      uvs.push(u, startV, u, endV)
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
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

export function buildLeafGeometry(engine: TreeEngine, species: TreeSpecies) {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  if (species.foliage.form === 'none') return new BufferGeometry()

  const leafSourceForTip = (tipIndex: number) => {
    let sourceIndex = tipIndex
    while (sourceIndex > 0) {
      const source = engine.nodes[sourceIndex]
      if (source.parent === null) break

      const parent = engine.nodes[source.parent]
      const isMainContinuation = parent.children[0] === sourceIndex
      if (!isMainContinuation || parent.depth < species.foliage.minimumBranchDepth) break

      sourceIndex = source.parent
    }
    return engine.nodes[sourceIndex]
  }

  for (let nodeIndex = 1; nodeIndex < engine.nodes.length; nodeIndex += 1) {
    const node = engine.nodes[nodeIndex]
    if (
      node.children.length > 0 ||
      node.depth < species.foliage.minimumBranchDepth ||
      node.parent === null
    ) continue

    // Leaves belong to a living tip, not to the old joint behind it. First
    // children inherit the leaf source from the continuing shoot; later
    // offshoots become new sources and grow their own leaves in.
    const leafSource = leafSourceForTip(nodeIndex)
    const leafProgress = MathUtils.smoothstep(leafSource.progress, 0.72, 1) * MathUtils.smoothstep(leafSource.age, LEAF_GROWTH_START_AGE, LEAF_GROWTH_FULL_AGE)
    if (leafProgress <= 0.001) continue

    const parent = engine.nodes[node.parent]
    const segmentProgress = easedProgress(node.progress)
    const tipPosition = parent.position.clone().lerp(node.position, segmentProgress)
    const inheritsLeaf = leafSource !== node
    const leafDirection = inheritsLeaf
      ? parent.direction.clone().lerp(node.direction, segmentProgress).normalize()
      : node.direction

    for (let leafIndex = 0; leafIndex < species.foliage.leavesPerTip; leafIndex += 1) {
      const radialIndex = Math.floor((leafSource.leafSeed * 997 + leafIndex * 3.5) % node.radials.length)
      const radial = inheritsLeaf
        ? parent.radials[radialIndex].clone().lerp(node.radials[radialIndex], segmentProgress)
        : node.radials[radialIndex].clone()

      radial.addScaledVector(leafDirection, -radial.dot(leafDirection))
      if (radial.lengthSq() < 1e-8) radial.copy(node.radials[radialIndex])
      radial.normalize()

      const tangent = new Vector3().crossVectors(leafDirection, radial).normalize()
      const angle = (leafSource.leafSeed * 5.7 + leafIndex * 1.9) % Math.PI
      const widthAxis = radial
        .clone()
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(tangent, Math.sin(angle))
        .normalize()
      const heightAxis = leafDirection.clone().multiplyScalar(0.78).addScaledVector(tangent, 0.38).normalize()
      const width = species.foliage.width * (0.75 + leafSource.leafSeed * 0.3) * leafProgress
      const height = species.foliage.height * (0.8 + leafSource.leafSeed * 0.25) * leafProgress
      const center = tipPosition.clone().addScaledVector(radial, 0.075 + leafIndex * 0.025)
      const halfWidth = widthAxis.multiplyScalar(width)
      const halfHeight = heightAxis.multiplyScalar(height)
      const baseVertex = positions.length / 3
      const corners = [
        center.clone().sub(halfWidth).sub(halfHeight),
        center.clone().add(halfWidth).sub(halfHeight),
        center.clone().add(halfWidth).add(halfHeight),
        center.clone().sub(halfWidth).add(halfHeight),
      ]
      for (const corner of corners) positions.push(corner.x, corner.y, corner.z)
      uvs.push(0, 0, 1, 0, 1, 1, 0, 1)
      indices.push(baseVertex, baseVertex + 1, baseVertex + 2, baseVertex, baseVertex + 2, baseVertex + 3)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}
