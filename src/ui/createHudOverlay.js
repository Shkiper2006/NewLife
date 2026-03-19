function formatList(items) {
  return items.length > 0 ? items.join(', ') : '—';
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

export function createHudOverlay() {
  const hud = document.createElement('aside');
  hud.className = 'hud-overlay';

  const panel = document.createElement('div');
  panel.className = 'hud-panel';
  hud.append(panel);

  const tip = document.createElement('div');
  tip.className = 'hud-tip';
  tip.textContent = 'Возрастная стадия управляет механиками, доступом и прогрессией.';
  hud.append(tip);

  const update = ({ player, capabilities, access, progression, world }) => {
    panel.innerHTML = `
      <span class="hud-label">Progression HUD</span>
      <h1>NewLife Age Gates</h1>
      <section class="hud-section">
        <h2>${player.stage}</h2>
        <ul>
          <li>Health: ${player.stats.health}%</li>
          <li>Hunger: ${player.stats.hunger}%</li>
          <li>Thirst: ${player.stats.thirst}%</li>
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
      ${renderWorldZones(world)}
      ${renderWorldGates(world)}
      ${renderVerticality(world)}
      ${renderInfrastructure(world)}
    `;
  };

  update({
    player: {
      stage: 'Infant',
      stats: { health: 100, hunger: 100, thirst: 100, experience: 0 },
      abilities: { unlockedSkills: [] },
    },
    capabilities: {
      locomotionModes: ['crawl', 'roll'],
      craftRecipes: ['soft-cloth-wrap', 'rattle-toy'],
      worldInteractions: ['observe', 'listen', 'grab-nearby', 'call-for-help'],
      constraints: {
        maxReachHeight: 0.8,
        maxCarryWeight: 2,
        weaponTier: 0,
        zoneAccess: ['hospital', 'hospital_vents'],
      },
    },
    access: {
      movement: { crawl: true, run: false, climb: false, vault: false, ride: false },
      crafting: { 'soft-cloth-wrap': true, 'stone-axe': false, 'iron-spear': false },
      interactions: { gather: false, repair: false, forge: false, 'call-for-help': true },
      constraints: {
        enterHospitalVents: true,
        enterYards: false,
        enterRooftops: false,
        enterControlCenter: false,
        carrySupplyCrate: false,
        reachSecurityPanel: false,
        equipTierTwoWeapon: false,
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
