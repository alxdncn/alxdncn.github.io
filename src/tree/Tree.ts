import { Vector3 } from 'three'
import { TreeEngine, type TreeStats } from './TreeEngine'
import type { TreeSpecies } from './TreeSpecies'

export interface TreeResources {
  water: number
  storedEnergy: number
  soilNutrients: number
  growthResourcesConsumed: number
}

/** A living tree instance: species traits, resources, and its growth colonies. */
export class Tree {
  readonly species: TreeSpecies
  readonly canopy: TreeEngine
  readonly roots: TreeEngine
  readonly resources: TreeResources
  health = 1

  constructor(species: TreeSpecies, seed: number, branching: number, rootBranching: number, initialGrowthSteps = 0) {
    this.species = species
    const profile = species.growthAlgorithm
    const canopySpread = profile.canopy.resourceSpread ?? new Vector3(7.5, 7.5, 7.5)
    const rootSpread = profile.roots.resourceSpread ?? new Vector3(4.5, 4.5, 4.5)

    this.canopy = new TreeEngine(seed, {
      ...profile.canopy,
      resourceCount: branching,
      resourceSpread: species.shapeResourceField(canopySpread),
    })
    this.canopy.preGrow(initialGrowthSteps)
    this.roots = new TreeEngine(seed ^ 0x5f3759df, {
      ...profile.roots,
      resourceCount: rootBranching,
      resourceSpread: species.shapeResourceField(rootSpread),
      ...(rootBranching <= 0 ? { maxNodes: 1 } : {}),
    })
    this.resources = {
      water: species.physiology.waterRetention,
      storedEnergy: 0,
      soilNutrients: 0,
      growthResourcesConsumed: 0,
    }
  }

  get stability() {
    return this.species.morphology.stability
  }

  get stats(): TreeStats {
    const canopy = this.canopy.stats
    const roots = this.roots.stats
    return {
      branches: canopy.branches,
      roots: roots.branches,
      resources: canopy.resources + roots.resources,
      growing: canopy.growing || roots.growing,
    }
  }

  update(deltaSeconds: number, speed: number) {
    const canopyChanged = this.canopy.update(deltaSeconds, speed)
    const rootsChanged = this.roots.update(
      deltaSeconds,
      speed * this.species.growthAlgorithm.rootGrowthRate,
    )
    if (canopyChanged || rootsChanged) {
      this.resources.growthResourcesConsumed +=
        deltaSeconds * speed * this.species.physiology.growthResourceConsumption
    }
    return canopyChanged || rootsChanged
  }

  retainWater(amount: number) {
    this.resources.water = Math.min(
      this.species.physiology.waterRetention,
      this.resources.water + Math.max(0, amount),
    )
    return this.resources.water
  }

  absorbSunlight(amount: number) {
    const absorbed = Math.max(0, amount) * this.species.physiology.sunAbsorptionEfficiency
    this.resources.storedEnergy += absorbed
    return absorbed
  }

  absorbSoilNutrients(amount: number) {
    const absorbed = Math.max(0, amount) * this.species.physiology.soilNutrientEfficiency
    this.resources.soilNutrients += absorbed
    return absorbed
  }

  applyInsectPressure(amount: number) {
    const damage = Math.max(0, amount) * (1 - this.species.physiology.insectResistance)
    this.health = Math.max(0, this.health - damage)
    return damage
  }
}
