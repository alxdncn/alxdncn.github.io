import { MathUtils, Vector3 } from 'three'

export type AttractionResourceType = 'sun' | 'nutrients' | 'water'

export interface AttractionResourceConfig {
  type: AttractionResourceType
  ratio: number
  weight: number
}

export interface TreeConfig {
  growthDirection: Vector3
  meshSides: number
  resourceCount: number
  resourceSpread: Vector3
  resourceStartY: number
  resources: AttractionResourceConfig[]
  minDistance: number
  maxDistance: number
  branchLength: number
  pullForce: number
  randomness: number
  maxNodes: number
}

export interface BranchNode {
  position: Vector3
  direction: Vector3
  parent: number | null
  children: number[]
  depth: number
  progress: number
  age: number
  radials: Vector3[]
  ringScale: number[]
  leafSeed: number
}

export interface TreeStats {
  branches: number
  roots: number
  resources: number
  growing: boolean
}

interface AttractionTarget {
  position: Vector3
  type: AttractionResourceType
  weight: number
}

export const DEFAULT_TREE_CONFIG: TreeConfig = {
  growthDirection: new Vector3(0, 1, 0),
  meshSides: 8,
  resourceCount: 420,
  resourceSpread: new Vector3(7.5, 7.5, 7.5),
  resourceStartY: 7.2,
  resources: [{ type: 'nutrients', ratio: 1, weight: 1 }],
  minDistance: 0.48,
  maxDistance: 2.45,
  branchLength: 0.36,
  pullForce: 0.22,
  randomness: 0.07,
  maxNodes: 3_200,
}

const UP = new Vector3(0, 1, 0)
const EPSILON = 1e-8

function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function makeInitialRing(sides: number, axis: Vector3) {
  const basisX = new Vector3(1, 0, 0).addScaledVector(axis, -axis.x)
  if (basisX.lengthSq() < EPSILON) basisX.set(0, 0, 1)
  basisX.normalize()
  const basisY = basisX.clone().cross(axis).normalize()

  return Array.from({ length: sides }, (_, index) => {
    const angle = (index / sides) * Math.PI * 2
    return basisX.clone().multiplyScalar(Math.cos(angle)).addScaledVector(basisY, Math.sin(angle))
  })
}

/**
 * Projecting the parent's ring onto the child's cross-section plane is a
 * discrete parallel transport. It preserves vertex correspondence through a
 * bend and prevents the 180-degree roll flips found in the Unity mesh code.
 */
function transportRing(parentRing: Vector3[], axis: Vector3) {
  const fallback = Math.abs(axis.y) < 0.95 ? UP : new Vector3(1, 0, 0)
  const basisX = new Vector3().crossVectors(fallback, axis).normalize()
  const basisY = basisX.clone().cross(axis).normalize()

  return parentRing.map((parentRadial, index) => {
    const radial = parentRadial.clone().addScaledVector(axis, -parentRadial.dot(axis))
    if (radial.lengthSq() < EPSILON) {
      const angle = (index / parentRing.length) * Math.PI * 2
      return basisX.clone().multiplyScalar(Math.cos(angle)).addScaledVector(basisY, Math.sin(angle))
    }
    return radial.normalize()
  })
}

function normalizeResources(resources: AttractionResourceConfig[]) {
  const usable = resources.filter((resource) => resource.ratio > 0 && resource.weight > 0)
  const fallback = usable.length > 0 ? usable : DEFAULT_TREE_CONFIG.resources
  const totalRatio = fallback.reduce((total, resource) => total + resource.ratio, 0)
  let cumulative = 0

  return fallback.map((resource) => {
    cumulative += resource.ratio / totalRatio
    return { ...resource, threshold: cumulative }
  })
}

export class TreeEngine {
  readonly nodes: BranchNode[] = []
  readonly targets: AttractionTarget[] = []
  readonly config: TreeConfig

  private readonly random: () => number
  private trunkTip = 0
  private phase: 'trunk' | 'canopy' | 'done' = 'trunk'
  private generationCooldown = 0

  constructor(seed: number, overrides: Partial<TreeConfig> = {}) {
    this.config = {
      ...DEFAULT_TREE_CONFIG,
      ...overrides,
      growthDirection: (overrides.growthDirection ?? DEFAULT_TREE_CONFIG.growthDirection).clone(),
      resourceSpread: (overrides.resourceSpread ?? DEFAULT_TREE_CONFIG.resourceSpread).clone(),
      resources: (overrides.resources ?? DEFAULT_TREE_CONFIG.resources).map((resource) => ({ ...resource })),
    }
    this.random = mulberry32(seed || 1)
    const growthDirection = this.config.growthDirection.clone().normalize()

    this.nodes.push({
      position: new Vector3(0, 0.02, 0),
      direction: growthDirection,
      parent: null,
      children: [],
      depth: 0,
      progress: 1,
      age: 1,
      radials: makeInitialRing(this.config.meshSides, growthDirection),
      ringScale: Array.from({ length: this.config.meshSides }, () => 0.9 + this.random() * 0.2),
      leafSeed: this.random(),
    })

    // This keeps the original Unity distribution shape, but the samples now
    // represent tunable resources such as sun, water, and soil nutrients.
    const resourceDistribution = normalizeResources(this.config.resources)
    for (let index = 0; index < this.config.resourceCount; index += 1) {
      const resourceRoll = this.random()
      const resource =
        resourceDistribution.find((candidate) => resourceRoll <= candidate.threshold) ??
        resourceDistribution[resourceDistribution.length - 1]

      this.targets.push({
        position: new Vector3(
          (this.random() - 0.5) * this.config.resourceSpread.x,
          (this.random() - 0.5) * this.config.resourceSpread.y + this.config.resourceStartY,
          (this.random() - 0.5) * this.config.resourceSpread.z,
        ),
        type: resource.type,
        weight: resource.weight,
      })
    }
  }

  get stats(): TreeStats {
    return {
      branches: Math.max(0, this.nodes.length - 1),
      roots: 0,
      resources: this.targets.length,
      growing: this.phase !== 'done',
    }
  }

  preGrow(generations: number) {
    let generationsGrown = 0
    const generationCount = Math.max(0, Math.floor(generations))

    while (generationsGrown < generationCount && this.phase !== 'done') {
      if (!this.growGeneration()) break
      generationsGrown += 1
    }

    for (const node of this.nodes) {
      node.progress = 1
      node.age = Math.max(node.age, 1)
    }
    this.generationCooldown = 0
  }

  update(deltaSeconds: number, speed: number) {
    let changed = false
    let hasGrowingSegment = false
    const segmentSpeed = Math.max(0.1, speed) * 2.25

    for (let index = 1; index < this.nodes.length; index += 1) {
      const node = this.nodes[index]
      node.age += deltaSeconds * speed
      if (node.progress < 1) {
        node.progress = Math.min(1, node.progress + deltaSeconds * segmentSpeed)
        hasGrowingSegment = node.progress < 1
        changed = true
      }
    }

    this.generationCooldown -= deltaSeconds * speed
    if (!hasGrowingSegment && this.phase !== 'done' && this.generationCooldown <= 0) {
      changed = this.growGeneration() || changed
      this.generationCooldown = 0.055
    }

    return changed
  }

  private growGeneration() {
    if (this.nodes.length >= this.config.maxNodes) {
      this.phase = 'done'
      return false
    }

    if (this.phase === 'trunk') {
      const tip = this.nodes[this.trunkTip]
      const closeEnough = this.targets.some(
        (target) => target.position.distanceToSquared(tip.position) < this.config.maxDistance ** 2,
      )
      if (closeEnough) {
        this.phase = 'canopy'
      } else {
        this.trunkTip = this.spawn(this.trunkTip, this.config.growthDirection)
        return true
      }
    }

    const nodeCount = this.nodes.length
    const sums = Array.from({ length: nodeCount }, () => new Vector3())
    const influenceTargets = Array.from({ length: nodeCount }, () => [] as AttractionTarget[])
    const influenceWeights = new Float32Array(nodeCount)
    const reached = new Set<number>()
    const minDistanceSquared = this.config.minDistance ** 2
    const maxDistanceSquared = this.config.maxDistance ** 2

    for (let targetIndex = 0; targetIndex < this.targets.length; targetIndex += 1) {
      const target = this.targets[targetIndex]
      let closestIndex = -1
      let closestDistanceSquared = Number.POSITIVE_INFINITY

      for (let branchIndex = 0; branchIndex < nodeCount; branchIndex += 1) {
        const branch = this.nodes[branchIndex]
        const distanceSquared = target.position.distanceToSquared(branch.position)
        if (distanceSquared < minDistanceSquared) {
          reached.add(targetIndex)
          closestIndex = -1
          break
        }
        if (distanceSquared <= maxDistanceSquared && distanceSquared < closestDistanceSquared) {
          closestDistanceSquared = distanceSquared
          closestIndex = branchIndex
        }
      }

      if (closestIndex >= 0) {
        sums[closestIndex].addScaledVector(
          target.position.clone().sub(this.nodes[closestIndex].position).normalize(),
          target.weight,
        )
        influenceTargets[closestIndex].push(target)
        influenceWeights[closestIndex] += target.weight
      }
    }

    for (let index = this.targets.length - 1; index >= 0; index -= 1) {
      if (reached.has(index)) this.targets.splice(index, 1)
    }

    let branchesAdded = 0
    for (let index = 0; index < nodeCount && this.nodes.length < this.config.maxNodes; index += 1) {
      if (influenceWeights[index] === 0) continue

      const parent = this.nodes[index]
      const attraction = sums[index].divideScalar(influenceWeights[index]).normalize()
      const direction = parent.direction
        .clone()
        .addScaledVector(attraction, this.config.pullForce)
        .add(
          new Vector3(
            (this.random() * 2 - 1) * this.config.randomness,
            (this.random() * 2 - 1) * this.config.randomness,
            (this.random() * 2 - 1) * this.config.randomness,
          ),
        )
        .normalize()

      if (parent.children.length > 0 && !this.canOffshootContinue(parent, direction, influenceTargets[index])) {
        continue
      }

      this.spawn(index, direction)
      branchesAdded += 1
    }

    if (
      this.targets.length === 0 ||
      branchesAdded === 0 ||
      this.nodes.length >= this.config.maxNodes
    ) {
      this.phase = 'done'
    }
    return branchesAdded > 0
  }

  private canOffshootContinue(parent: BranchNode, direction: Vector3, targets: AttractionTarget[]) {
    const nextPosition = parent.position.clone().addScaledVector(direction, this.config.branchLength)
    const minDistanceSquared = this.config.minDistance ** 2
    const maxDistanceSquared = this.config.maxDistance ** 2

    return targets.some((target) => {
      const nextDistanceSquared = target.position.distanceToSquared(nextPosition)
      return (
        nextDistanceSquared > minDistanceSquared &&
        nextDistanceSquared <= maxDistanceSquared &&
        nextDistanceSquared < target.position.distanceToSquared(parent.position)
      )
    })
  }

  private spawn(parentIndex: number, direction: Vector3) {
    const parent = this.nodes[parentIndex]
    const normalizedDirection = direction.clone().normalize()
    const node: BranchNode = {
      position: parent.position.clone().addScaledVector(normalizedDirection, this.config.branchLength),
      direction: normalizedDirection,
      parent: parentIndex,
      children: [],
      depth: parent.depth + 1,
      progress: 0,
      age: 0,
      radials: transportRing(parent.radials, normalizedDirection),
      ringScale: Array.from({ length: this.config.meshSides }, () => 0.8 + this.random() * 0.4),
      leafSeed: this.random(),
    }
    const childIndex = this.nodes.push(node) - 1
    parent.children.push(childIndex)
    return childIndex
  }
}

export function easedProgress(progress: number) {
  return MathUtils.smoothstep(progress, 0, 1)
}
