import { Vector3 } from 'three'
import type { TreeConfig } from './TreeEngine'

export type FoliageForm = 'broadleaf' | 'needle' | 'scale' | 'none'
export type FoliageHabit = 'deciduous' | 'evergreen' | 'semi-evergreen'

export interface FoliageProfile {
  form: FoliageForm
  habit: FoliageHabit
  /** Human-readable cultivar/shape name, e.g. "lobed broadleaf" or "paired needles". */
  type: string
  leavesPerTip: number
  minimumBranchDepth: number
  width: number
  height: number
}

export interface MorphologyProfile {
  /** Relative vertical extension and canopy height. 1 is the baseline. */
  heightGrowthRate: number
  /** Relative lateral spread. 1 is the baseline. */
  widthGrowthRate: number
  /** Relative branch/root radius accumulation. 1 is the baseline. */
  thickeningRate: number
  /** Resistance to uprooting and wind damage, normalized to 0..1. */
  stability: number
}

export interface PhysiologyProfile {
  /** Relative internal water capacity. 1 is the baseline. */
  waterRetention: number
  /** Resource units spent per second of active growth. */
  growthResourceConsumption: number
  /** Nutrient gained per soil-resource unit, normalized to 0..1. */
  soilNutrientEfficiency: number
  /** Energy gained per sunlight unit, normalized to 0..1. */
  sunAbsorptionEfficiency: number
  /** Fraction of insect pressure resisted, normalized to 0..1. */
  insectResistance: number
}

export interface TreeAppearance {
  barkTextureUrl: string
  barkNormalUrl: string
  foliageTextureUrl: string
  barkColor: string
  rootColor: string
  foliageColor: string
}

export interface GrowthAlgorithmProfile {
  id: 'space-colonization'
  canopy: Partial<TreeConfig>
  roots: Partial<TreeConfig>
  rootDensityRatio: number
  rootGrowthRate: number
}

export interface TreeSpeciesDefinition {
  id: string
  commonName: string
  scientificName?: string
  foliage: FoliageProfile
  morphology: MorphologyProfile
  physiology: PhysiologyProfile
  appearance: TreeAppearance
  growthAlgorithm: GrowthAlgorithmProfile
}

function unitInterval(value: number, label: string) {
  if (value < 0 || value > 1) throw new RangeError(`${label} must be between 0 and 1`)
  return value
}

function positive(value: number, label: string) {
  if (value <= 0) throw new RangeError(`${label} must be greater than zero`)
  return value
}

/**
 * Immutable biological and visual definition shared by every tree of a
 * species. New species are data-first subclasses or instances of this class;
 * they do not need to modify the renderer or growth engine.
 */
export class TreeSpecies {
  readonly id: string
  readonly commonName: string
  readonly scientificName?: string
  readonly foliage: Readonly<FoliageProfile>
  readonly morphology: Readonly<MorphologyProfile>
  readonly physiology: Readonly<PhysiologyProfile>
  readonly appearance: Readonly<TreeAppearance>
  readonly growthAlgorithm: Readonly<GrowthAlgorithmProfile>

  constructor(definition: TreeSpeciesDefinition) {
    this.id = definition.id
    this.commonName = definition.commonName
    this.scientificName = definition.scientificName
    this.foliage = Object.freeze({ ...definition.foliage })
    this.morphology = Object.freeze({
      ...definition.morphology,
      heightGrowthRate: positive(definition.morphology.heightGrowthRate, 'heightGrowthRate'),
      widthGrowthRate: positive(definition.morphology.widthGrowthRate, 'widthGrowthRate'),
      thickeningRate: positive(definition.morphology.thickeningRate, 'thickeningRate'),
      stability: unitInterval(definition.morphology.stability, 'stability'),
    })
    this.physiology = Object.freeze({
      ...definition.physiology,
      waterRetention: positive(definition.physiology.waterRetention, 'waterRetention'),
      growthResourceConsumption: positive(
        definition.physiology.growthResourceConsumption,
        'growthResourceConsumption',
      ),
      soilNutrientEfficiency: unitInterval(
        definition.physiology.soilNutrientEfficiency,
        'soilNutrientEfficiency',
      ),
      sunAbsorptionEfficiency: unitInterval(
        definition.physiology.sunAbsorptionEfficiency,
        'sunAbsorptionEfficiency',
      ),
      insectResistance: unitInterval(definition.physiology.insectResistance, 'insectResistance'),
    })
    this.appearance = Object.freeze({ ...definition.appearance })
    this.growthAlgorithm = Object.freeze({ ...definition.growthAlgorithm })
  }

  /** Apply species morphology to an algorithm's base attraction-field shape. */
  shapeResourceField(baseSpread: Vector3) {
    return new Vector3(
      baseSpread.x * this.morphology.widthGrowthRate,
      baseSpread.y * this.morphology.heightGrowthRate,
      baseSpread.z * this.morphology.widthGrowthRate,
    )
  }
}
