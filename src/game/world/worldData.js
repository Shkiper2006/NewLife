import { AgeStage } from '../progression/ageStages.js';
import { AccessRequirementType, createRequirement } from './accessRequirements.js';

const age = (stage) => createRequirement(AccessRequirementType.AgeStage, stage);
const move = (mode) => createRequirement(AccessRequirementType.MovementMode, mode);
const skill = (skillId) => createRequirement(AccessRequirementType.Skill, skillId);
const interact = (interactionId) => createRequirement(AccessRequirementType.WorldInteraction, interactionId);
const training = (milestoneId) => createRequirement(AccessRequirementType.TutorialMilestone, milestoneId);
const story = (goalId) => createRequirement(AccessRequirementType.StoryGoal, goalId);
const allOf = (...options) => createRequirement(AccessRequirementType.AllOf, null, { options });
const anyOf = (...options) => createRequirement(AccessRequirementType.AnyOf, null, { options });

export const NavigationType = Object.freeze({
  CrampedCrawlspace: 'cramped-crawlspace',
  LayeredInterior: 'layered-interior',
  OpenTraversal: 'open-traversal',
  VerticalTraversal: 'vertical-traversal',
  InfrastructureTraversal: 'infrastructure-traversal',
  SystemsControl: 'systems-control',
});

export const DangerLevel = Object.freeze({
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
});

export const WORLD_ZONES = Object.freeze({
  hospital: Object.freeze({
    id: 'hospital',
    name: 'St. Dympna Hospital',
    navigationType: NavigationType.LayeredInterior,
    dangerLevel: DangerLevel.Low,
    entryRequirement: age(AgeStage.Infant),
    requiredAbilities: ['observe', 'grab-nearby', 'call-for-help'],
    keyResources: ['sterile-bandages', 'formula-cache', 'plastic-tags', 'rolling-carts'],
    storyTriggers: ['wake-in-nursery', 'hear-code-blue', 'follow-caregiver-footsteps'],
    traversalFantasy: 'Safe rooms, bed forests, carts, rails, and oversized adult architecture.',
    chunkIds: ['hospital-nursery', 'hospital-ward', 'hospital-service-core'],
    verticalityLayerIds: ['underbeds', 'crib-slats', 'linen-hampers'],
  }),
  hospital_vents: Object.freeze({
    id: 'hospital_vents',
    name: 'Hospital Ventilation Grid',
    navigationType: NavigationType.CrampedCrawlspace,
    dangerLevel: DangerLevel.Medium,
    entryRequirement: allOf(age(AgeStage.Infant), anyOf(skill('squeeze-through-vents'), training('basic-mobility'))),
    requiredAbilities: ['crawl', 'listen', 'observe'],
    keyResources: ['dust-motes', 'lost-keycards', 'maintenance-maps'],
    storyTriggers: ['escape-checkup-room', 'overhear-emergency-briefing', 'find-first-shortcut'],
    traversalFantasy: 'Micro-routes for tiny bodies: grates, duct fans, dangling wires, and hidden ledges.',
    chunkIds: ['vents-intake', 'vents-crossroads', 'vents-discharge'],
    verticalityLayerIds: ['vent-grates', 'maintenance-gaps', 'pipe-brackets'],
  }),
  streets: Object.freeze({
    id: 'streets',
    name: 'Quarantine Streets',
    navigationType: NavigationType.OpenTraversal,
    dangerLevel: DangerLevel.High,
    entryRequirement: allOf(age(AgeStage.Teen), move('run'), training('advanced-traversal')),
    requiredAbilities: ['run', 'talk', 'trade', 'repair'],
    keyResources: ['salvage', 'bike-parts', 'public-terminals', 'market-rations'],
    storyTriggers: ['cross-first-checkpoint', 'meet-courier-faction', 'trace-blackout-origin'],
    traversalFantasy: 'Long sightlines, broken asphalt, parked cars, and public spaces reclaimed route by route.',
    chunkIds: ['streets-market', 'streets-checkpoint', 'streets-transit'],
    verticalityLayerIds: ['storm-drains', 'bus-underframes', 'construction-barriers'],
  }),
  yards: Object.freeze({
    id: 'yards',
    name: 'Inner Courtyards',
    navigationType: NavigationType.OpenTraversal,
    dangerLevel: DangerLevel.Medium,
    entryRequirement: allOf(age(AgeStage.Child), move('run')),
    requiredAbilities: ['run', 'gather', 'talk', 'open-simple-doors'],
    keyResources: ['rainwater', 'berries', 'cloth-lines', 'pet-shelters'],
    storyTriggers: ['win-neighborhood-trust', 'find-safe-play-route', 'unlock-family-hideout'],
    traversalFantasy: 'Semi-safe exterior pockets between buildings with fences, puddles, and child-scale shortcuts.',
    chunkIds: ['yards-playground', 'yards-garden', 'yards-sheds'],
    verticalityLayerIds: ['bench-undersides', 'fence-holes', 'doghouse-roofs'],
  }),
  rooftops: Object.freeze({
    id: 'rooftops',
    name: 'Rooftop Spine',
    navigationType: NavigationType.VerticalTraversal,
    dangerLevel: DangerLevel.High,
    entryRequirement: allOf(age(AgeStage.Teen), move('climb'), move('vault'), skill('ledge-balance')),
    requiredAbilities: ['climb', 'vault', 'trade', 'mentor-followers'],
    keyResources: ['antenna-parts', 'solar-cells', 'signal-flares'],
    storyTriggers: ['see-city-scope', 'activate-roof-beacon', 'meet-watchers-network'],
    traversalFantasy: 'Risky skyline chain of ladders, awnings, cables, and improvised bridges.',
    chunkIds: ['rooftops-tenements', 'rooftops-greenhouse', 'rooftops-relay'],
    verticalityLayerIds: ['window-ledges', 'awning-ribs', 'sign-brackets'],
  }),
  utility_tunnels: Object.freeze({
    id: 'utility_tunnels',
    name: 'Utility Tunnel Network',
    navigationType: NavigationType.InfrastructureTraversal,
    dangerLevel: DangerLevel.High,
    entryRequirement: allOf(age(AgeStage.Teen), anyOf(skill('service-panel-access'), interact('repair'))),
    requiredAbilities: ['repair', 'use-workbenches', 'hunt-small-game'],
    keyResources: ['copper-wire', 'water-filters', 'fuse-boxes', 'maintenance-tools'],
    storyTriggers: ['restore-water-pressure', 'bypass-security-grid', 'discover-hidden-substation'],
    traversalFantasy: 'Claustrophobic service loops under the city, mixing stealth, routing, and systemic repairs.',
    chunkIds: ['tunnels-pump-room', 'tunnels-cable-run', 'tunnels-substation'],
    verticalityLayerIds: ['pipe-caps', 'maintenance-ledges', 'drain-channels'],
  }),
  control_center: Object.freeze({
    id: 'control_center',
    name: 'Municipal Control Center',
    navigationType: NavigationType.SystemsControl,
    dangerLevel: DangerLevel.Critical,
    entryRequirement: allOf(age(AgeStage.Adult), story('restore-frontier-beacon'), skill('control-center-clearance')),
    requiredAbilities: ['command-gate', 'build-outpost', 'forge', 'lead-ritual'],
    keyResources: ['grid-map', 'security-keys', 'city-archives', 'override-codes'],
    storyTriggers: ['assume-network-control', 'stabilize-district-services', 'choose-city-future'],
    traversalFantasy: 'A late-game command layer where infrastructure becomes both puzzle space and political power.',
    chunkIds: ['control-center-atrium', 'control-center-ops', 'control-center-core'],
    verticalityLayerIds: ['server-bays', 'catwalk-grates', 'maintenance-shafts'],
  }),
});

export const EARLY_WORLD_VERTICALITY = Object.freeze({
  doctrine: 'The infant and child phases reinterpret everyday objects as layered traversal spaces before the city opens horizontally.',
  passageTypes: Object.freeze([
    Object.freeze({
      id: 'underbeds',
      label: 'Passages under beds',
      description: 'Low-clearance stealth lanes hidden from adults, ideal for infant scouting and escape beats.',
      accessibleStages: [AgeStage.Infant, AgeStage.Child],
      blockedForAdults: true,
    }),
    Object.freeze({
      id: 'crib-slats',
      label: 'Crib and railing slats',
      description: 'Micro-gaps that function as climb puzzles only when the player is small and light.',
      accessibleStages: [AgeStage.Infant],
      blockedForAdults: true,
    }),
    Object.freeze({
      id: 'vent-grates',
      label: 'Ventilation access',
      description: 'Narrow ventilation shafts connect nursery, ward, and supply rooms before doors can be opened normally.',
      accessibleStages: [AgeStage.Infant, AgeStage.Child],
      blockedForAdults: false,
    }),
    Object.freeze({
      id: 'maintenance-gaps',
      label: 'Narrow service gaps',
      description: 'Cracks behind cabinets and pipes create hidden loops that reward tiny-body navigation.',
      accessibleStages: [AgeStage.Infant, AgeStage.Child, AgeStage.Teen],
      blockedForAdults: false,
    }),
    Object.freeze({
      id: 'adult-scale-objects',
      label: 'Adult-scale obstacles',
      description: 'Door handles, elevator buttons, desks, and scanners remain unreachable until new movement or reach mechanics mature.',
      accessibleStages: [AgeStage.Child, AgeStage.Teen, AgeStage.Adult],
      blockedForAdults: false,
    }),
  ]),
});

export const ADULT_INFRASTRUCTURE_LAYER = Object.freeze({
  id: 'adult-infrastructure-layer',
  systems: Object.freeze([
    Object.freeze({
      id: 'power-grid',
      name: 'Electrical grid',
      gameplayRole: 'Routes energy to lifts, doors, rooftop relays, and defensive grids.',
      linkedZones: ['utility_tunnels', 'rooftops', 'control_center'],
    }),
    Object.freeze({
      id: 'water-network',
      name: 'Water and pressure lines',
      gameplayRole: 'Controls sanitation, hydro barriers, and district viability.',
      linkedZones: ['yards', 'utility_tunnels', 'control_center'],
    }),
    Object.freeze({
      id: 'city-comms',
      name: 'Communication mesh',
      gameplayRole: 'Unlocks faction coordination, map intelligence, and remote story beats.',
      linkedZones: ['streets', 'rooftops', 'control_center'],
    }),
    Object.freeze({
      id: 'auto-security',
      name: 'Automated security systems',
      gameplayRole: 'Late-game defense layer of cameras, shutters, drones, and lockdown scripts.',
      linkedZones: ['hospital', 'utility_tunnels', 'control_center'],
    }),
  ]),
});

export const WORLD_GATES = Object.freeze([
  Object.freeze({
    id: 'ward-to-vents',
    fromZoneId: 'hospital',
    toZoneId: 'hospital_vents',
    routeType: 'micro-shortcut',
    unlocks: 'First stealth network through the hospital shell.',
    requirement: allOf(age(AgeStage.Infant), anyOf(skill('squeeze-through-vents'), training('basic-mobility'))),
  }),
  Object.freeze({
    id: 'ward-to-yards',
    fromZoneId: 'hospital',
    toZoneId: 'yards',
    routeType: 'courtyard-exit',
    unlocks: 'A safer outside loop once the player can run and use simple doors.',
    requirement: allOf(age(AgeStage.Child), move('run'), interact('open-simple-doors')),
  }),
  Object.freeze({
    id: 'yards-to-streets',
    fromZoneId: 'yards',
    toZoneId: 'streets',
    routeType: 'checkpoint-push',
    unlocks: 'Full district-scale traversal and social factions.',
    requirement: allOf(age(AgeStage.Teen), training('advanced-traversal')),
  }),
  Object.freeze({
    id: 'streets-to-rooftops',
    fromZoneId: 'streets',
    toZoneId: 'rooftops',
    routeType: 'vertical-skyline',
    unlocks: 'High-speed bypasses, beacon lines, and long-range recon.',
    requirement: allOf(age(AgeStage.Teen), move('climb'), move('vault'), skill('ledge-balance')),
  }),
  Object.freeze({
    id: 'streets-to-tunnels',
    fromZoneId: 'streets',
    toZoneId: 'utility_tunnels',
    routeType: 'service-descent',
    unlocks: 'Infrastructure routing under hostile surface routes.',
    requirement: allOf(age(AgeStage.Teen), anyOf(skill('service-panel-access'), interact('repair'))),
  }),
  Object.freeze({
    id: 'tunnels-to-control-center',
    fromZoneId: 'utility_tunnels',
    toZoneId: 'control_center',
    routeType: 'systems-core',
    unlocks: 'Adult governance layer over power, water, comms, and security.',
    requirement: allOf(age(AgeStage.Adult), story('restore-frontier-beacon'), skill('control-center-clearance')),
  }),
]);
