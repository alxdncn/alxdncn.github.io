import { MathUtils, Quaternion, Vector3 } from 'three'

export type AttractionResourceType = 'sun' | 'nutrients' | 'water'

export interface AttractionResourceConfig {
  type: AttractionResourceType
  ratio: number
  weight: number
}

/** Shape rules for one order of a deciduous tree, from trunk to twig. */
export interface BranchOrderConfig {
  sectionCount: number
  childCount: number
  lengthScale: number
  branchAngle: number
  branchStart: number
  taper: number
  gnarliness: number
  twist: number
  upwardForce: number
  gravity: number
}

export interface TreeConfig {
  growthDirection: Vector3
  meshSides: number
  /** Maximum number of generated branch sections. */
  resourceCount: number
  resourceSpread: Vector3
  resourceStartY: number
  resources: AttractionResourceConfig[]
  branchLength: number
  randomness: number
  branchProbability: number
  growthSpeed: number
  lateralDelay: number
  leafGrowthDelay: number
  leafGrowthDuration: number
  branchOrders: BranchOrderConfig[]
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
  branchId: number
  branchLevel: number
  sectionIndex: number
  sectionCount: number
  lateral: boolean
  taper: number
  growthStart: number
  growthEnd: number
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

interface PendingBranch {
  parentIndex: number
  level: number
  direction: Vector3
  startTime: number
  lateral: boolean
  lengthVariation: number
}

export const DEFAULT_TREE_CONFIG: TreeConfig = {
  growthDirection: new Vector3(0, 1, 0),
  meshSides: 6,
  resourceCount: 420,
  resourceSpread: new Vector3(7.5, 7.5, 7.5),
  resourceStartY: 7.2,
  resources: [{ type: 'nutrients', ratio: 1, weight: 1 }],
  branchLength: 0.38,
  randomness: 0.06,
  branchProbability: 0.88,
  growthSpeed: 0.76,
  lateralDelay: 0.24,
  leafGrowthDelay: 0.55,
  leafGrowthDuration: 2.35,
  branchOrders: [
    {
      sectionCount: 14,
      childCount: 5,
      lengthScale: 1,
      branchAngle: 0.94,
      branchStart: 0.38,
      taper: 0.58,
      gnarliness: 0.012,
      twist: 0.08,
      upwardForce: 0.03,
      gravity: 0,
    },
    {
      sectionCount: 8,
      childCount: 3,
      lengthScale: 0.98,
      branchAngle: 1,
      branchStart: 0.16,
      taper: 0.5,
      gnarliness: 0.026,
      twist: 0.14,
      upwardForce: 0.052,
      gravity: 0.032,
    },
    {
      sectionCount: 5,
      childCount: 2,
      lengthScale: 0.86,
      branchAngle: 0.68,
      branchStart: 0.12,
      taper: 0.64,
      gnarliness: 0.046,
      twist: 0.19,
      upwardForce: 0.072,
      gravity: 0.025,
    },
    {
      sectionCount: 3,
      childCount: 0,
      lengthScale: 0.72,
      branchAngle: 0,
      branchStart: 0,
      taper: 0.8,
      gnarliness: 0.074,
      twist: 0.23,
      upwardForce: 0.09,
      gravity: 0.018,
    },
  ],
  maxNodes: 720,
}

const UP = new Vector3(0, 1, 0)
const DOWN = new Vector3(0, -1, 0)
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

/** Parallel-transport a cross-section through a bend without roll flips. */
function transportRing(parentRing: Vector3[], axis: Vector3, twist: number) {
  const fallback = Math.abs(axis.y) < 0.95 ? UP : new Vector3(1, 0, 0)
  const basisX = new Vector3().crossVectors(fallback, axis).normalize()
  const basisY = basisX.clone().cross(axis).normalize()
  const twistRotation = new Quaternion().setFromAxisAngle(axis, twist)

  return parentRing.map((parentRadial, index) => {
    const radial = parentRadial.clone().addScaledVector(axis, -parentRadial.dot(axis))
    if (radial.lengthSq() < EPSILON) {
      const angle = (index / parentRing.length) * Math.PI * 2
      radial.copy(basisX).multiplyScalar(Math.cos(angle)).addScaledVector(basisY, Math.sin(angle))
    } else {
      radial.normalize()
    }
    return radial.applyQuaternion(twistRotation).normalize()
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

function shuffledIndices(count: number, random: () => number) {
  const values = Array.from({ length: count }, (_, index) => index)
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[values[index], values[swapIndex]] = [values[swapIndex], values[index]]
  }
  return values
}

/**
 * A deterministic deciduous-tree skeleton.
 *
 * The full, low-poly topology is built once. Animation only advances a clock;
 * each section and leaf carries its own start/end time for the renderer. This
 * avoids synchronized recursion waves and all per-frame topology allocation.
 */
export class TreeEngine {
  readonly nodes: BranchNode[] = []
  readonly targets: AttractionTarget[] = []
  readonly config: TreeConfig

  private readonly random: () => number
  private readonly segmentBudget: number
  private nextBranchId = 0
  private clock = 0
  private finishTime = 0

  constructor(seed: number, overrides: Partial<TreeConfig> = {}) {
    this.config = {
      ...DEFAULT_TREE_CONFIG,
      ...overrides,
      growthDirection: (overrides.growthDirection ?? DEFAULT_TREE_CONFIG.growthDirection).clone(),
      resourceSpread: (overrides.resourceSpread ?? DEFAULT_TREE_CONFIG.resourceSpread).clone(),
      resources: (overrides.resources ?? DEFAULT_TREE_CONFIG.resources).map((resource) => ({ ...resource })),
      branchOrders: (overrides.branchOrders ?? DEFAULT_TREE_CONFIG.branchOrders).map((order) => ({ ...order })),
    }
    this.random = mulberry32(seed || 1)
    this.segmentBudget = Math.min(
      Math.max(0, Math.floor(this.config.resourceCount)),
      Math.max(0, Math.floor(this.config.maxNodes) - 1),
    )
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
      ringScale: Array.from({ length: this.config.meshSides }, () => 0.96 + this.random() * 0.08),
      leafSeed: this.random(),
      branchId: -1,
      branchLevel: 0,
      sectionIndex: 0,
      sectionCount: 0,
      lateral: false,
      taper: 0,
      growthStart: 0,
      growthEnd: 0,
    })

    // Resource records remain useful to the surrounding tree/physiology API,
    // but morphology is controlled by the branch-order rules above.
    const resourceRandom = mulberry32((seed ^ 0x9e3779b9) || 1)
    const resourceDistribution = normalizeResources(this.config.resources)
    for (let index = 0; index < this.segmentBudget; index += 1) {
      const roll = resourceRandom()
      const resource =
        resourceDistribution.find((candidate) => roll <= candidate.threshold) ??
        resourceDistribution[resourceDistribution.length - 1]
      this.targets.push({
        position: new Vector3(
          (resourceRandom() - 0.5) * this.config.resourceSpread.x,
          (resourceRandom() - 0.5) * this.config.resourceSpread.y + this.config.resourceStartY,
          (resourceRandom() - 0.5) * this.config.resourceSpread.z,
        ),
        type: resource.type,
        weight: resource.weight,
      })
    }

    if (this.segmentBudget > 0 && this.config.branchOrders.length > 0) {
      this.buildSkeleton(growthDirection)
    }
    const lastWoodTime = this.nodes.reduce((latest, node) => Math.max(latest, node.growthEnd), 0)
    this.finishTime =
      this.nodes.length > 1
        ? lastWoodTime + this.config.leafGrowthDelay * 2 + this.config.leafGrowthDuration * 1.45
        : 0
    this.updateNodeState()
  }

  get growthTime() {
    return this.clock
  }

  get duration() {
    return this.finishTime
  }

  get stats(): TreeStats {
    const visibleBranches = this.nodes.reduce(
      (total, node, index) => total + (index > 0 && node.progress > 0.001 ? 1 : 0),
      0,
    )
    return {
      branches: visibleBranches,
      roots: 0,
      resources: Math.max(0, this.nodes.length - 1 - visibleBranches),
      growing: this.clock < this.finishTime,
    }
  }

  /** Reveal the first N chronologically completed sections before first paint. */
  preGrow(segments: number) {
    const segmentCount = Math.max(0, Math.floor(segments))
    if (segmentCount === 0 || this.nodes.length <= 1) return
    const completionTimes = this.nodes
      .slice(1)
      .map((node) => node.growthEnd)
      .sort((a, b) => a - b)
    this.clock = completionTimes[Math.min(segmentCount, completionTimes.length) - 1] ?? 0
    this.updateNodeState()
  }

  update(deltaSeconds: number, speed: number) {
    if (this.clock >= this.finishTime || deltaSeconds <= 0 || speed <= 0) return false
    const previousTime = this.clock
    this.clock = Math.min(this.finishTime, this.clock + deltaSeconds * speed)
    this.updateNodeState()
    return this.clock > previousTime
  }

  completeGrowth() {
    if (this.clock >= this.finishTime) return false
    this.clock = this.finishTime
    this.updateNodeState()
    return true
  }

  private buildSkeleton(growthDirection: Vector3) {
    const branchQueue: PendingBranch[] = [
      {
        parentIndex: 0,
        level: 0,
        direction: growthDirection,
        startTime: 0,
        lateral: false,
        lengthVariation: 1,
      },
    ]

    while (branchQueue.length > 0 && this.nodes.length - 1 < this.segmentBudget) {
      const branch = branchQueue.shift()
      if (!branch) break
      this.growBranch(branch, branchQueue)
    }
  }

  private growBranch(branch: PendingBranch, queue: PendingBranch[]) {
    const order = this.config.branchOrders[branch.level]
    if (!order) return

    const branchId = this.nextBranchId
    this.nextBranchId += 1
    const growthAxis = this.config.growthDirection.clone().normalize()
    const axisScale = new Vector3(
      this.config.resourceSpread.x / DEFAULT_TREE_CONFIG.resourceSpread.x,
      this.config.resourceSpread.y / DEFAULT_TREE_CONFIG.resourceSpread.y,
      this.config.resourceSpread.z / DEFAULT_TREE_CONFIG.resourceSpread.z,
    )
    const sectionLength = this.config.branchLength * order.lengthScale * branch.lengthVariation
    const sectionDuration = sectionLength / Math.max(0.01, this.config.growthSpeed)
    const branchNodes: number[] = []
    let parentIndex = branch.parentIndex
    let direction = branch.direction.clone().normalize()
    let wander = this.randomPerpendicular(direction)
    let sectionStart = branch.startTime

    for (let section = 1; section <= order.sectionCount; section += 1) {
      if (this.nodes.length - 1 >= this.segmentBudget) break
      const scaledStep = direction.clone().multiplyScalar(sectionLength).multiply(axisScale)
      const position = this.nodes[parentIndex].position.clone().add(scaledStep)
      const growthEnd = sectionStart + sectionDuration * (0.92 + this.random() * 0.16)
      const nodeIndex = this.spawn(parentIndex, position, direction, {
        branchId,
        branchLevel: branch.level,
        sectionIndex: section,
        sectionCount: order.sectionCount,
        lateral: branch.lateral,
        taper: order.taper,
        growthStart: sectionStart,
        growthEnd,
        twist: order.twist,
      })
      branchNodes.push(nodeIndex)
      parentIndex = nodeIndex
      sectionStart = growthEnd

      // Accumulated, correlated curvature makes one coherent limb. Thinner
      // orders wander and respond to light/gravity more strongly.
      const freshWander = this.randomPerpendicular(direction)
      wander.lerp(freshWander, 0.22 + branch.level * 0.05).normalize()
      const along = section / order.sectionCount
      const thinness = 1 + branch.level * 0.58 + order.taper * along * 0.34
      direction
        .addScaledVector(
          wander,
          (order.gnarliness + this.config.randomness * 0.18) * thinness,
        )
        .addScaledVector(growthAxis, order.upwardForce * thinness)
        .addScaledVector(DOWN, order.gravity * (branch.lateral ? 1 : 0.35) * along)
        .normalize()
    }

    if (
      branchNodes.length !== order.sectionCount ||
      branch.level >= this.config.branchOrders.length - 1
    ) return

    const nextLevel = branch.level + 1
    const finalNode = this.nodes[branchNodes[branchNodes.length - 1]]
    const continuationDirection = finalNode.direction
      .clone()
      .addScaledVector(this.randomPerpendicular(finalNode.direction), order.gnarliness * 1.6)
      .normalize()

    // A deciduous limb keeps a leader while also producing laterals. That is
    // the key distinction from the old binary endpoint fork.
    queue.push({
      parentIndex: branchNodes[branchNodes.length - 1],
      level: nextLevel,
      direction: continuationDirection,
      startTime: finalNode.growthEnd + this.config.lateralDelay * 0.18,
      lateral: false,
      lengthVariation: 0.78 + this.random() * 0.16,
    })

    const childCount = Math.max(0, Math.floor(order.childCount))
    if (childCount === 0) return
    const radialOffset = this.random()
    const angleSlots = shuffledIndices(childCount, this.random)

    for (let child = 0; child < childCount; child += 1) {
      if (child > 0 && this.random() > this.config.branchProbability) continue
      const slotFraction = (child + 0.34 + this.random() * 0.32) / childCount
      const attachmentFraction = MathUtils.lerp(order.branchStart, 0.94, slotFraction)
      const branchNodeIndex = MathUtils.clamp(
        Math.round(attachmentFraction * (branchNodes.length - 1)),
        0,
        branchNodes.length - 1,
      )
      const attachmentIndex = branchNodes[branchNodeIndex]
      const attachment = this.nodes[attachmentIndex]
      const radialJitter = (this.random() - 0.5) * (0.72 / childCount)
      const radialAngle =
        Math.PI * 2 * (radialOffset + (angleSlots[child] + 0.5) / childCount + radialJitter)
      const radialX = attachment.radials[0]
      const radialY = new Vector3().crossVectors(attachment.direction, radialX).normalize()
      const radial = radialX
        .clone()
        .multiplyScalar(Math.cos(radialAngle))
        .addScaledVector(radialY, Math.sin(radialAngle))
        .normalize()
      const childDirection = attachment.direction
        .clone()
        .multiplyScalar(Math.cos(order.branchAngle))
        .addScaledVector(radial, Math.sin(order.branchAngle))
        .addScaledVector(growthAxis, 0.045 + nextLevel * 0.016)
        .normalize()

      queue.push({
        parentIndex: attachmentIndex,
        level: nextLevel,
        direction: childDirection,
        startTime:
          attachment.growthEnd + this.config.lateralDelay * (0.45 + this.random() * 1.15),
        lateral: true,
        lengthVariation: 0.92 + this.random() * 0.26,
      })
    }
  }

  private randomPerpendicular(axis: Vector3) {
    const candidate = new Vector3(
      this.random() * 2 - 1,
      this.random() * 2 - 1,
      this.random() * 2 - 1,
    )
    candidate.addScaledVector(axis, -candidate.dot(axis))
    if (candidate.lengthSq() < EPSILON) {
      candidate.copy(Math.abs(axis.y) < 0.9 ? UP : new Vector3(1, 0, 0))
      candidate.addScaledVector(axis, -candidate.dot(axis))
    }
    return candidate.normalize()
  }

  private spawn(
    parentIndex: number,
    position: Vector3,
    direction: Vector3,
    metadata: {
      branchId: number
      branchLevel: number
      sectionIndex: number
      sectionCount: number
      lateral: boolean
      taper: number
      growthStart: number
      growthEnd: number
      twist: number
    },
  ) {
    const parent = this.nodes[parentIndex]
    const normalizedDirection = direction.clone().normalize()
    const ringScale = parent.ringScale.map(
      (scale) => scale * 0.74 + (0.94 + this.random() * 0.12) * 0.26,
    )
    const node: BranchNode = {
      position,
      direction: normalizedDirection,
      parent: parentIndex,
      children: [],
      depth: parent.depth + 1,
      progress: 0,
      age: 0,
      radials: transportRing(parent.radials, normalizedDirection, metadata.twist),
      ringScale,
      leafSeed: this.random(),
      ...metadata,
    }
    const childIndex = this.nodes.push(node) - 1
    parent.children.push(childIndex)
    return childIndex
  }

  private updateNodeState() {
    for (let index = 1; index < this.nodes.length; index += 1) {
      const node = this.nodes[index]
      node.progress = MathUtils.clamp(
        (this.clock - node.growthStart) / Math.max(EPSILON, node.growthEnd - node.growthStart),
        0,
        1,
      )
      node.age = Math.max(0, this.clock - node.growthStart)
    }
  }
}

export function easedProgress(progress: number) {
  return MathUtils.smoothstep(progress, 0, 1)
}
