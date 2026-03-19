function formatList(items) {
  return items.length > 0 ? items.join(', ') : '—';
}

function formatResourceMap(values) {
  const entries = Object.entries(values)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, amount]) => `<li><span>${key}</span><strong>${Number(amount).toFixed(amount % 1 === 0 ? 0 : 2)}</strong></li>`)
    .join('');

  return entries.length > 0 ? `<ul class="hud-grid-list">${entries}</ul>` : '<p>—</p>';
}

function renderBooleanMap(title, values) {
  const entries = Object.entries(values)
    .map(([key, enabled]) => `<li><span>${key}</span><strong>${enabled ? 'yes' : 'no'}</strong></li>`)
    .join('');

  return `
    <section class="hud-section hud-section-compact">
      <h3>${title}</h3>
      <ul class="hud-grid-list">${entries}</ul>
    </section>
  `;
}

function renderWorldZones(world) {
  const entries = world.zones
    .map(
      (zone) => `
        <li>
          <strong>${zone.name}</strong>
          <span>${zone.navigationType} · danger ${zone.dangerLevel}</span>
          <span>Resources: ${formatList(zone.keyResources)}</span>
          <span>Triggers: ${formatList(zone.storyTriggers)}</span>
          <span>Chunks: ${zone.chunkPlan.map((chunk) => chunk.id).join(', ')}</span>
        </li>
      `,
    )
    .join('');

  return `
    <section class="hud-section">
      <h3>Accessible world zones</h3>
      <p>Active zone: ${world.activeZoneId}</p>
      <ul class="hud-detail-list">${entries}</ul>
    </section>
  `;
}

function renderWorldGates(world) {
  const entries = world.gates
    .map(
      (gate) => `
        <li>
          <strong>${gate.id}</strong>
          <span>${gate.fromZoneId} → ${gate.toZoneId}</span>
          <span>${gate.unlocks}</span>
          <span>${gate.requirementLabel}</span>
          <strong>${gate.unlocked ? 'open' : 'locked'}</strong>
        </li>
      `,
    )
    .join('');

  return `
    <section class="hud-section">
      <h3>World gates</h3>
      <ul class="hud-detail-list">${entries}</ul>
    </section>
  `;
}

function renderVerticality(world) {
  const entries = world.verticality.passageTypes
    .map(
      (passage) => `
        <li>
          <strong>${passage.label}</strong>
          <span>${passage.description}</span>
          <span>Stages: ${passage.accessibleStages.join(', ')}</span>
          <span>Blocked for adults: ${passage.blockedForAdults ? 'yes' : 'no'}</span>
        </li>
      `,
    )
    .join('');

  return `
    <section class="hud-section">
      <h3>Early verticality</h3>
      <p>${world.verticality.doctrine}</p>
      <ul class="hud-detail-list">${entries}</ul>
    </section>
  `;
}

function renderInfrastructure(world) {
  const entries = world.infrastructure.systems
    .map(
      (system) => `
        <li>
          <strong>${system.name}</strong>
          <span>${system.gameplayRole}</span>
          <span>Zones: ${system.linkedZones.join(', ')}</span>
        </li>
      `,
    )
    .join('');

  return `
    <section class="hud-section">
      <h3>Adult infrastructure layer</h3>
      <ul class="hud-detail-list">${entries}</ul>
    </section>
  `;
}

function renderSurvival(survival, access) {
  const placements = survival.base.placements
    .map(
      (placement) => `
        <li>
          <strong>${placement.structureId}</strong>
          <span>Snap: ${placement.snapPointId}</span>
          <span>Pos: ${placement.position.x}, ${placement.position.z}</span>
        </li>
      `,
    )
    .join('');

  const recipes = survival.recipePlan
    .map(
      (recipe) => `
        <li>
          <strong>${recipe.name}</strong>
          <span>Need: ${Object.entries(recipe.ingredients)
            .map(([itemId, amount]) => `${itemId}×${amount}`)
            .join(', ')}</span>
          <span>Output: ${Object.entries(recipe.output)
            .map(([itemId, amount]) => `${itemId}×${amount}`)
            .join(', ')}</span>
        </li>
      `,
    )
    .join('');

  return `
    <section class="hud-section">
      <h3>Survival loop</h3>
      <ul>
        <li>Rest: ${survival.needs.rest.toFixed(1)}%</li>
        <li>Safety: ${survival.needs.safety.toFixed(1)}%</li>
        <li>Pressure: ${survival.needs.pressure.toFixed(2)}</li>
        <li>Action multiplier: ${access.modifiers.actionMultiplier}</li>
        <li>Save unlocked: ${access.modifiers.saveUnlocked ? 'yes' : 'no'}</li>
        <li>Recovery unlocked: ${access.modifiers.recoveryUnlocked ? 'yes' : 'no'}</li>
      </ul>
    </section>
    <section class="hud-section">
      <h3>Resources</h3>
      ${formatResourceMap(survival.inventory)}
    </section>
    <section class="hud-section">
      <h3>Craft plan by stage</h3>
      <p>Hints: ${formatList(survival.stageHints)}</p>
      <ul class="hud-detail-list">${recipes}</ul>
    </section>
    <section class="hud-section">
      <h3>Base safety & placement</h3>
      <ul>
        <li>Shelter coverage: ${survival.base.summary.shelterCoverage.toFixed(2)}</li>
        <li>Defense coverage: ${survival.base.summary.defenseCoverage.toFixed(2)}</li>
        <li>Utility coverage: ${survival.base.summary.utilityCoverage.toFixed(2)}</li>
        <li>Recovery rate: ${survival.base.summary.recoveryRate.toFixed(2)}</li>
      </ul>
      <ul class="hud-detail-list">${placements || '<li><strong>Пока нет построек</strong><span>Сначала нужно скрафтить укрытие.</span></li>'}</ul>
    </section>
    <section class="hud-section">
      <h3>Recent survival events</h3>
      <ul class="hud-detail-list">${(survival.logs.length > 0 ? survival.logs : ['Ожидание первых крафтов и построек.'])
        .map((entry) => `<li><span>${entry}</span></li>`)
        .join('')}</ul>
    </section>
  `;
}

export function createHudOverlay() {
  const hud = document.createElement('aside');
  hud.className = 'hud-overlay';

  const panel = document.createElement('div');
  panel.className = 'hud-panel';
  hud.append(panel);

  const tip = document.createElement('div');
  tip.className = 'hud-tip';
  tip.textContent = 'Прототип: потребности деградируют, рецепты крафтятся по возрасту, а база снижает риск и открывает отдых.';
  hud.append(tip);

  const update = ({ player, capabilities, access, progression, world, survival }) => {
    panel.innerHTML = `
      <span class="hud-label">Progression HUD</span>
      <h1>NewLife Survival Prototype</h1>
      <section class="hud-section">
        <h2>${player.stage}</h2>
        <ul>
          <li>Health: ${player.stats.health.toFixed(1)}%</li>
          <li>Hunger: ${player.stats.hunger.toFixed(1)}%</li>
          <li>Thirst: ${player.stats.thirst.toFixed(1)}%</li>
          <li>Rest: ${player.stats.rest.toFixed(1)}%</li>
          <li>Safety: ${player.stats.safety.toFixed(1)}%</li>
          <li>Experience: ${player.stats.experience}</li>
        </ul>
      </section>
      <section class="hud-section">
        <h3>Unlocked skills</h3>
        <p>${formatList(player.abilities.unlockedSkills)}</p>
      </section>
      <section class="hud-section">
        <h3>Locomotion</h3>
        <p>${formatList(capabilities.locomotionModes)}</p>
        <h3>Crafting</h3>
        <p>${formatList(capabilities.craftRecipes)}</p>
        <h3>World interactions</h3>
        <p>${formatList(capabilities.worldInteractions)}</p>
      </section>
      <section class="hud-section">
        <h3>Constraints</h3>
        <ul>
          <li>Reach height: ${capabilities.constraints.maxReachHeight.toFixed(1)}m</li>
          <li>Carry weight: ${capabilities.constraints.maxCarryWeight}kg</li>
          <li>Weapon tier: ${capabilities.constraints.weaponTier}</li>
          <li>Zones: ${formatList(capabilities.constraints.zoneAccess)}</li>
        </ul>
      </section>
      <section class="hud-section">
        <h3>Next transition</h3>
        <p>Next stage: ${progression.nextStage ?? 'Final stage reached'}</p>
        <p>Missing XP: ${progression.missing.experience}</p>
        <p>Missing goals: ${formatList(progression.missing.storyGoals)}</p>
        <p>Missing items: ${formatList(progression.missing.requiredItems)}</p>
        <p>Missing training: ${formatList(progression.missing.tutorialMilestones)}</p>
      </section>
      ${renderBooleanMap('Movement checks', access.movement)}
      ${renderBooleanMap('Craft checks', access.crafting)}
      ${renderBooleanMap('Interaction checks', access.interactions)}
      ${renderBooleanMap('Constraint checks', access.constraints)}
      ${renderSurvival(survival, access)}
      ${renderWorldZones(world)}
      ${renderWorldGates(world)}
      ${renderVerticality(world)}
      ${renderInfrastructure(world)}
    `;
  };

  update({
    player: {
      stage: 'Infant',
      stats: { health: 100, hunger: 100, thirst: 100, rest: 100, safety: 18, experience: 0 },
      abilities: { unlockedSkills: [] },
    },
    capabilities: {
      locomotionModes: ['crawl', 'roll'],
      craftRecipes: ['infant-rope', 'infant-simple-shelter'],
      worldInteractions: ['observe', 'listen', 'grab-nearby', 'call-for-help', 'rest-in-shelter'],
      constraints: {
        maxReachHeight: 0.8,
        maxCarryWeight: 2,
        weaponTier: 0,
        zoneAccess: ['hospital', 'hospital_vents'],
      },
    },
    access: {
      movement: { crawl: true, run: false, climb: false, vault: false, ride: false },
      crafting: { 'infant-simple-shelter': true, 'teen-spear': false, 'adult-fortification': false },
      interactions: { gather: false, repair: false, forge: false, 'rest-in-shelter': true },
      constraints: {
        enterHospitalVents: true,
        enterYards: false,
        enterRooftops: false,
        enterControlCenter: false,
        carrySupplyCrate: false,
        reachSecurityPanel: false,
        equipTierTwoWeapon: false,
      },
      modifiers: {
        actionMultiplier: 1,
        saveUnlocked: false,
        recoveryUnlocked: false,
      },
    },
    progression: {
      nextStage: 'Child',
      missing: {
        experience: 100,
        storyGoals: ['survive-first-night'],
        requiredItems: ['family-totem'],
        tutorialMilestones: ['basic-mobility', 'first-foraging-lesson'],
      },
    },
    survival: {
      needs: { rest: 100, safety: 18, pressure: 0.3 },
      inventory: { rags: 8, bottle: 2, water: 2, sticks: 10, cloth: 6, metal_scrap: 4 },
      base: {
        placements: [],
        summary: { shelterCoverage: 0, defenseCoverage: 0, utilityCoverage: 0, recoveryRate: 0 },
      },
      logs: ['Ожидание первых крафтов и построек.'],
      recipePlan: [
        { id: 'infant-rope', name: 'Верёвка из тряпок', ingredients: { rags: 2 }, output: { rope: 1 } },
        { id: 'infant-simple-shelter', name: 'Простое укрытие', ingredients: { rope: 2, cloth: 2, sticks: 4 }, output: { simple_shelter: 1 } },
      ],
      stageHints: ['искать тряпки рядом с местом старта', 'использовать бутылочки для воды'],
    },
    world: {
      activeZoneId: 'hospital',
      zones: [
        {
          name: 'St. Dympna Hospital',
          navigationType: 'layered-interior',
          dangerLevel: 'low',
          keyResources: ['sterile-bandages'],
          storyTriggers: ['wake-in-nursery'],
          chunkPlan: [{ id: 'hospital-nursery' }],
        },
      ],
      gates: [
        {
          id: 'ward-to-vents',
          fromZoneId: 'hospital',
          toZoneId: 'hospital_vents',
          unlocks: 'First stealth network through the hospital shell.',
          requirementLabel: 'Age stage: Infant+',
          unlocked: true,
        },
      ],
      verticality: {
        doctrine: 'The infant and child phases reinterpret everyday objects as layered traversal spaces before the city opens horizontally.',
        passageTypes: [
          {
            label: 'Passages under beds',
            description: 'Low-clearance stealth lanes hidden from adults.',
            accessibleStages: ['Infant', 'Child'],
            blockedForAdults: true,
          },
        ],
      },
      infrastructure: {
        systems: [
          {
            name: 'Electrical grid',
            gameplayRole: 'Routes energy to lifts, doors, rooftop relays, and defensive grids.',
            linkedZones: ['utility_tunnels', 'rooftops', 'control_center'],
          },
        ],
      },
    },
  });

  return {
    element: hud,
    update,
  };
}
