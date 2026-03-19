export function createHudOverlay() {
  const hud = document.createElement('aside');
  hud.className = 'hud-overlay';
  hud.innerHTML = `
    <div class="hud-panel">
      <span class="hud-label">HUD</span>
      <h1>NewLife Prototype</h1>
      <ul>
        <li>HP: 100%</li>
        <li>Stamina: 100%</li>
        <li>Objective: bootstrap core loop</li>
      </ul>
    </div>
    <div class="hud-tip">WASD / Space / Mouse — controls placeholder</div>
  `;

  return hud;
}
