import { Vector3 } from 'three'
import { TreeSpecies } from '../TreeSpecies'

/** A lightweight, open-crowned deciduous bonsai for the portfolio hero. */
export class LegacyBonsaiSpecies extends TreeSpecies {
  constructor() {
    super({
      id: 'legacy-bonsai',
      commonName: 'Deciduous Bonsai',
      foliage: {
        form: 'broadleaf',
        habit: 'deciduous',
        type: 'lobed broadleaf',
        leavesPerTip: 8,
        minimumBranchDepth: 9,
        width: 0.245,
        height: 0.4,
      },
      morphology: {
        heightGrowthRate: 1,
        widthGrowthRate: 1,
        thickeningRate: 1,
        stability: 0.72,
      },
      physiology: {
        waterRetention: 0.58,
        growthResourceConsumption: 1,
        soilNutrientEfficiency: 0.72,
        sunAbsorptionEfficiency: 0.78,
        insectResistance: 0.48,
      },
      appearance: {
        barkTextureUrl: '/textures/Bark1.jpeg',
        barkNormalUrl: '/textures/BarkBump1.png',
        foliageTextureUrl: '/textures/Leaves2Sat.png',
        barkColor: '#ffffff',
        rootColor: '#ffffff',
        foliageColor: '#ffffff',
      },
      growthAlgorithm: {
        id: 'recursive-deciduous',
        rootDensityRatio: 0.68,
        rootGrowthRate: 0.92,
        canopy: {
          meshSides: 6,
          resourceSpread: new Vector3(7.5, 7.5, 7.5),
          resources: [{ type: 'sun', ratio: 1, weight: 1 }],
          branchLength: 0.44,
          randomness: 0.055,
          branchProbability: 0.88,
          growthSpeed: 0.78,
          lateralDelay: 0.24,
          leafGrowthDelay: 0.52,
          leafGrowthDuration: 2.3,
          branchOrders: [
            {
              sectionCount: 16,
              childCount: 5,
              lengthScale: 1,
              branchAngle: 1.04,
              branchStart: 0.32,
              taper: 0.58,
              gnarliness: 0.014,
              twist: 0.09,
              upwardForce: 0.032,
              gravity: 0,
            },
            {
              sectionCount: 9,
              childCount: 3,
              lengthScale: 1.06,
              branchAngle: 1.01,
              branchStart: 0.16,
              taper: 0.5,
              gnarliness: 0.028,
              twist: 0.15,
              upwardForce: 0.048,
              gravity: 0.04,
            },
            {
              sectionCount: 6,
              childCount: 2,
              lengthScale: 0.86,
              branchAngle: 0.68,
              branchStart: 0.12,
              taper: 0.64,
              gnarliness: 0.048,
              twist: 0.2,
              upwardForce: 0.074,
              gravity: 0.026,
            },
            {
              sectionCount: 4,
              childCount: 0,
              lengthScale: 0.72,
              branchAngle: 0,
              branchStart: 0,
              taper: 0.8,
              gnarliness: 0.076,
              twist: 0.24,
              upwardForce: 0.09,
              gravity: 0.018,
            },
          ],
          maxNodes: 600,
        },
        roots: {
          growthDirection: new Vector3(0, -1, 0),
          resourceSpread: new Vector3(4.5, 4.5, 4.5),
          resourceStartY: -3.5,
          resources: [
            { type: 'water', ratio: 0.58, weight: 1.12 },
            { type: 'nutrients', ratio: 0.42, weight: 0.82 },
          ],
          branchLength: 0.3,
          randomness: 0.16,
          branchProbability: 0.78,
          growthSpeed: 0.64,
          maxNodes: 850,
        },
      },
    })
  }
}

export const legacyBonsaiSpecies = new LegacyBonsaiSpecies()
