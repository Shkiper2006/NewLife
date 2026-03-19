import { AGE_STAGES } from '../game/progression/ageStages';
import { RECIPE_DEFINITIONS } from '../game/crafting/recipes';
import { selectInventoryEntries, useGameStore } from '../game/core/useGameStore';

function StatBar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="hud-stat">
      <div className="hud-stat__row">
        <span>{label}</span>
        <strong>{Math.round(value)}</strong>
      </div>
      <div className="hud-bar">
        <div className="hud-bar__fill" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: tone }} />
      </div>
    </div>
  );
}

export function Hud() {
  const health = useGameStore((state) => state.health);
  const hunger = useGameStore((state) => state.hunger);
  const thirst = useGameStore((state) => state.thirst);
  const stage = useGameStore((state) => state.stage);
  const inventory = useGameStore((state) => state.inventory);
  const objective = useGameStore((state) => state.activeObjective);
  const logs = useGameStore((state) => state.logs);
  const canEscape = useGameStore((state) => state.canEscape);
  const remote = useGameStore((state) => state.remoteSnapshot);

  return (
    <div className="hud-root">
      <div className="hud-panel hud-panel--left">
        <h1>Жизнь с Нуля</h1>
        <p className="hud-stage">Стадия: {AGE_STAGES[stage].label}</p>
        <p className="hud-stage-note">{AGE_STAGES[stage].description}</p>
        <StatBar label="Здоровье" value={health} tone="#ff7b7b" />
        <StatBar label="Голод" value={hunger} tone="#ffd36b" />
        <StatBar label="Жажда" value={thirst} tone="#6bc6ff" />
        <div className="hud-coop">Кооп: {remote ? `${remote.players.length}/2+ игроков в комнате` : 'локальный режим'}</div>
      </div>

      <div className="hud-panel hud-panel--right">
        <h2>Инвентарь</h2>
        <ul className="hud-list">
          {selectInventoryEntries(inventory).map((entry) => (
            <li key={entry.itemId}>
              <span>{entry.label}</span>
              <strong>x{entry.amount}</strong>
            </li>
          ))}
        </ul>

        <h2>Крафт</h2>
        <ul className="hud-list hud-list--recipes">
          {RECIPE_DEFINITIONS.map((recipe, index) => (
            <li key={recipe.id}>
              <span>{index + 1}. {recipe.label}</span>
              <small>
                {Object.entries(recipe.ingredients)
                  .map(([itemId, amount]) => `${itemId} x${amount}`)
                  .join(', ')}
              </small>
            </li>
          ))}
        </ul>

        <h2>Цель</h2>
        <p className="hud-objective-title">{objective.title}</p>
        <p className="hud-objective-text">{objective.detail}</p>
        <p className="hud-tip">{canEscape ? 'Маршрут открыт: ползите к голубой метке у пролома.' : 'Найдите ресурсы и поставьте укрытие в жёлтую зону.'}</p>
      </div>

      <div className="hud-panel hud-panel--bottom">
        <h2>Журнал</h2>
        <ul className="hud-log">
          {logs.map((entry, index) => (
            <li key={`${entry}-${index}`}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
