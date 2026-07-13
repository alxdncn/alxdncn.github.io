import { Vector3 } from 'three'
import { TreeSpecies } from '../TreeSpecies'

/** The original 2017 Bonsai look, expressed as the first reusable species. */
export class LegacyBonsaiSpecies extends TreeSpecies {
  constructor() {
    super({
      id: 'legacy-bonsai',
      commonName: 'Legacy Bonsai',
      foliage: {
        form: 'broadleaf',
        habit: 'deciduous',
        type: 'lobed broadleaf',
        leavesPerTip: 3,
        minimumBranchDepth: 7,
        width: 0.54,
        height: 0.84,
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
        barkColor: '#a68a62',
        rootColor: '#796348',
        foliageColor: '#8fb678',
      },
      growthAlgorithm: {
        id: 'space-colonization',
        rootDensityRatio: 0.68,
        rootGrowthRate: 0.92,
        canopy: {
          resourceSpread: new Vector3(7.5, 7.5, 7.5),
          resources: [{ type: 'sun', ratio: 1, weight: 1 }],
          minDistance: 0.36,
          maxDistance: 2.35,
          branchLength: 0.34,
          maxNodes: 3_400,
        },
        roots: {
          growthDirection: new Vector3(0, -1, 0),
          resourceSpread: new Vector3(4.5, 4.5, 4.5),
          resourceStartY: -3.5,
          resources: [
            { type: 'water', ratio: 0.58, weight: 1.12 },
            { type: 'nutrients', ratio: 0.42, weight: 0.82 },
          ],
          minDistance: 0.34,
          maxDistance: 1.2,
          branchLength: 0.3,
          pullForce: 0.17,
          randomness: 0.16,
          maxNodes: 850,
        },
      },
    })
  }
}

export const legacyBonsaiSpecies = new LegacyBonsaiSpecies()
