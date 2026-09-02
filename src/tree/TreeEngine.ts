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
  branchProbability: number
  branchAngle: number
  directionalBias: number
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
  branchProbability: 0.44,
  branchAngle: 0.62,
  directionalBias: 0.12,
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

    // Resources set the growth budget and the point where the trunk begins to
    // branch. Their positions deliberately do not steer branch directions.
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

  /**
   * Build a fixed number of segments before the tree is first rendered.
   *
   * A recursive generation can contain exponentially more segments than the
   * generation before it, so treating this value as a generation count can
   * exhaust the entire growth budget during setup. Keeping it as a segment
   * budget makes the initial state stable as branching parameters change.
   */
  preGrow(segments: number) {
    let segmentsGrown = 0
    const segmentBudget = Math.max(0, Math.floor(segments))

    while (segmentsGrown < segmentBudget && this.phase !== 'done') {
      const nodeCountBeforeGrowth = this.nodes.length
      if (!this.growGeneration(segmentBudget - segmentsGrown)) break
      segmentsGrown += this.nodes.length - nodeCountBeforeGrowth
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
    const segmentSpeed = Math.max(0.1, speed) * 0.805

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

  private growGeneration(branchLimit = Number.POSITIVE_INFINITY) {
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
    let branchesAdded = 0
    for (
      let index = 0;
      index < nodeCount &&
      this.nodes.length < this.config.maxNodes &&
      branchesAdded < branchLimit;
      index += 1
    ) {
      const parent = this.nodes[index]
      if (parent.children.length > 0 || this.targets.length === 0) continue

      this.spawn(index, this.fractalDirection(parent, false))
      this.targets.pop()
      branchesAdded += 1

      const branchChance = this.config.branchProbability * Math.min(1, parent.depth / 8)
      if (
        branchesAdded < branchLimit &&
        this.targets.length > 0 &&
        this.nodes.length < this.config.maxNodes &&
        this.random() < branchChance
      ) {
        this.spawn(index, this.fractalDirection(parent, true))
        this.targets.pop()
        branchesAdded += 1
      }
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

  private fractalDirection(parent: BranchNode, lateral: boolean) {
    const growthAxis = this.config.growthDirection.clone().normalize()
    const radialIndex = Math.floor(this.random() * parent.radials.length)
    const radial = parent.radials[radialIndex]
      .clone()
      .multiplyScalar(this.random() < 0.5 ? -1 : 1)
    const angle = lateral
      ? this.config.branchAngle * (0.82 + this.random() * 0.36)
      : this.config.branchAngle * (0.08 + this.random() * 0.12)
    const direction = parent.direction
      .clone()
      .multiplyScalar(Math.cos(angle))
      .addScaledVector(radial, Math.sin(angle))
      .lerp(growthAxis, this.config.directionalBias * (lateral ? 0.7 : 1))
      .add(
        new Vector3(
          (this.random() * 2 - 1) * this.config.randomness,
          (this.random() * 2 - 1) * this.config.randomness,
          (this.random() * 2 - 1) * this.config.randomness,
        ),
      )

    return direction.normalize()
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
