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

  const update = ({ player, capabilities, access, progression }) => {
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
        zoneAccess: ['nursery', 'safe-yard'],
      },
    },
    access: {
      movement: { crawl: true, run: false, ride: false },
      crafting: { 'soft-cloth-wrap': true, 'stone-axe': false, 'iron-spear': false },
      interactions: { gather: false, forge: false, 'call-for-help': true },
      constraints: { reachHighBranch: false, carrySupplyCrate: false, equipTierTwoWeapon: false, enterAncientVault: false },
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
  });

  return {
    element: hud,
    update,
  };
}
