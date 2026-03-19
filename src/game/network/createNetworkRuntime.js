import { createNetworkArchitectureBlueprint } from './architecture.js';
import {
  createBuildableEntity,
  createEnemyEntity,
  createPickupEntity,
  createPlayerEntity,
  createWorldEventEntity,
} from './entities.js';
import { createReplicationLayer } from './replication.js';
import { createSessionState } from './session.js';
import { PlayerRole, createRoleSyncState } from './roles.js';

const REMOTE_PLAYER_TEMPLATES = [
  { id: 'player-scout', name: 'Iris', role: PlayerRole.Scout, joinOrder: 1, offset: [-1.6, 0, -1.4], latencyMs: 41 },
  { id: 'player-builder', name: 'Maks', role: PlayerRole.Builder, joinOrder: 2, offset: [2.1, 0, 1.2], latencyMs: 56 },
  { id: 'player-medic', name: 'Sana', role: PlayerRole.Medic, joinOrder: 3, offset: [-2.8, 0, 2.4], latencyMs: 49 },
];

const STARTING_PICKUPS = [
  { id: 'pickup-water-cache', itemId: 'clean_water', amount: 2, position: [-3, 0, 2], spawnSource: 'camp-cache', respawnAt: 'nightfall' },
  { id: 'pickup-scrap-pile', itemId: 'metal_scrap', amount: 5, position: [3.2, 0, -2.4], spawnSource: 'ruin-scrap', respawnAt: 'server-seeded' },
];

const STARTING_ENEMIES = [
  { id: 'enemy-scavenger', archetype: 'Scavenger', health: 70, position: [4.8, 0, 4.2], spawnZoneId: 'yards', threatLevel: 'medium' },
];

export function createNetworkRuntime(playerState) {
  const architecture = createNetworkArchitectureBlueprint();
  const replication = createReplicationLayer(architecture.simulation);
  const session = createSessionState(architecture.session);
  const timelineEvents = new Set();
  const localPlayerId = 'player-local';

  playerState.setRole(PlayerRole.Engineer);
  playerState.setNetworkBonuses(createRoleSyncState(PlayerRole.Engineer, playerState.getSnapshot().stage).bonuses);

  session.joinPlayer({
    id: localPlayerId,
    name: 'You',
    joinOrder: 0,
    stage: playerState.getSnapshot().stage,
    role: playerState.getSnapshot().role,
    roleSync: createRoleSyncState(playerState.getSnapshot().role, playerState.getSnapshot().stage),
    latencyMs: 22,
    prediction: 'hybrid',
  });

  session.joinPlayer({
    ...REMOTE_PLAYER_TEMPLATES[0],
    stage: 'Child',
    roleSync: createRoleSyncState(REMOTE_PLAYER_TEMPLATES[0].role, 'Child'),
    prediction: 'hybrid',
  });

  session.joinPlayer({
    ...REMOTE_PLAYER_TEMPLATES[1],
    stage: 'Teen',
    roleSync: createRoleSyncState(REMOTE_PLAYER_TEMPLATES[1].role, 'Teen'),
    prediction: 'server',
  });

  function runSessionTimeline(elapsedSeconds) {
    if (elapsedSeconds >= 7 && !timelineEvents.has('medic-join')) {
      timelineEvents.add('medic-join');
      session.joinPlayer({
        ...REMOTE_PLAYER_TEMPLATES[2],
        stage: 'Teen',
        roleSync: createRoleSyncState(REMOTE_PLAYER_TEMPLATES[2].role, 'Teen'),
        prediction: 'server',
      });
    }

    if (elapsedSeconds >= 12 && !timelineEvents.has('builder-leave')) {
      timelineEvents.add('builder-leave');
      session.leavePlayer('player-builder');
    }

    if (elapsedSeconds >= 16 && !timelineEvents.has('builder-reconnect')) {
      timelineEvents.add('builder-reconnect');
      session.reconnectPlayer('player-builder', 64);
    }

    if (elapsedSeconds >= 19 && !timelineEvents.has('scout-respawn')) {
      timelineEvents.add('scout-respawn');
      session.respawnPlayer('player-scout', 'yard-safehouse');
    }
  }

  function syncStory(snapshot, world, survival) {
    session.updateSharedStoryProgress({
      chapterId: snapshot.stage === 'Adult' ? 'frontier-restoration' : 'prologue',
      checkpointId: world.activeZoneId,
      completedTriggers: snapshot.storyGoals,
      pendingTriggers: world.gates.filter((gate) => !gate.unlocked).map((gate) => gate.unlocks),
    });

    replication.replaceCollection('Buildable',
      survival.base.placements.map((placement, index) =>
        createBuildableEntity({
          id: `buildable-${placement.structureId}-${index}`,
          ownerId: localPlayerId,
          tags: ['interactive', 'construction'],
          state: {
            structureId: placement.structureId,
            snapPointId: placement.snapPointId,
            position: placement.position,
            effects: placement.effects,
            durability: Math.round((placement.effects.safety ?? 10) * 4),
            state: 'placed',
          },
        }),
      ),
    );
  }

  function syncPlayers(elapsedSeconds, snapshot) {
    const sessionSnapshot = session.getSnapshot();
    const entities = sessionSnapshot.roster.map((player, index) => {
      const isLocalPlayer = player.id === localPlayerId;
      const angle = elapsedSeconds * 0.35 + index * 1.2;
      const template = REMOTE_PLAYER_TEMPLATES.find((entry) => entry.id === player.id);
      const offset = template?.offset ?? [0, 0, 0];
      const position = isLocalPlayer
        ? [Math.sin(elapsedSeconds * 0.8) * 0.4, 0, Math.cos(elapsedSeconds * 0.8) * 0.4]
        : [offset[0] + Math.sin(angle) * 0.6, 0, offset[2] + Math.cos(angle) * 0.45];

      return createPlayerEntity({
        id: player.id,
        ownerId: player.id,
        tags: ['interactive', isLocalPlayer ? 'local-player' : 'remote-player'],
        state: {
          name: player.name,
          stage: isLocalPlayer ? snapshot.stage : player.stage,
          role: isLocalPlayer ? snapshot.role : player.role,
          roleBonuses: isLocalPlayer ? snapshot.networkBonuses : player.roleSync.bonuses,
          inventory: isLocalPlayer ? snapshot.inventory : [],
          storyFlags: isLocalPlayer ? snapshot.storyGoals : [],
          position,
          velocity: [0, 0, 0],
          cameraYaw: round(Math.sin(angle) * 0.45),
          animationState: player.status === 'disconnected' ? 'idle' : 'jog',
          health: player.health,
          status: player.status,
          latencyMs: player.latencyMs,
          respawnState: player.respawnState,
        },
      });
    });

    replication.replaceCollection('Player', entities);
  }

  function syncStaticEntities(world, survival, elapsedSeconds) {
    replication.replaceCollection('Pickup',
      STARTING_PICKUPS.map((pickup, index) =>
        createPickupEntity({
          id: pickup.id,
          tags: ['interactive', 'loot'],
          state: {
            itemId: pickup.itemId,
            amount: pickup.amount,
            spawnSource: pickup.spawnSource,
            respawnAt: pickup.respawnAt,
            position: [pickup.position[0], pickup.position[1], pickup.position[2] + Math.sin(elapsedSeconds * 0.5 + index) * 0.1],
            zoneId: world.activeZoneId,
          },
        }),
      ),
    );

    replication.replaceCollection('Enemy',
      STARTING_ENEMIES.map((enemy) =>
        createEnemyEntity({
          id: enemy.id,
          tags: ['interactive', 'combat'],
          state: {
            archetype: enemy.archetype,
            position: [enemy.position[0] + Math.sin(elapsedSeconds * 0.35) * 0.8, 0, enemy.position[2]],
            aggroTargetId: 'player-local',
            health: enemy.health,
            spawnZoneId: enemy.spawnZoneId,
            threatLevel: enemy.threatLevel,
            animationState: 'prowl',
          },
        }),
      ),
    );

    replication.replaceCollection('WorldEvent', [
      createWorldEventEntity({
        id: 'event-shared-story',
        tags: ['interactive', 'story'],
        state: {
          state: survival.base.summary.saveUnlocked ? 'checkpoint-live' : 'in-progress',
          zoneId: world.activeZoneId,
          participants: session.getSnapshot().roster.map((player) => player.id),
          storyFlags: session.getSnapshot().story.completedTriggers,
          progress: round((survival.base.summary.shelterCoverage + survival.base.summary.utilityCoverage) / 2),
        },
      }),
    ]);
  }

  return {
    update({ elapsedSeconds, world, survival }) {
      const playerSnapshot = playerState.getSnapshot();
      const roleSync = createRoleSyncState(playerSnapshot.role, playerSnapshot.stage);
      playerState.setNetworkBonuses(roleSync.bonuses);
      session.updatePlayer(localPlayerId, {
        stage: playerSnapshot.stage,
        role: playerSnapshot.role,
        roleSync,
        health: playerSnapshot.stats.health,
      });

      runSessionTimeline(elapsedSeconds);
      syncPlayers(elapsedSeconds, playerState.getSnapshot());
      syncStaticEntities(world, survival, elapsedSeconds);
      syncStory(playerState.getSnapshot(), world, survival);

      return this.getSnapshot();
    },
    getSnapshot() {
      return {
        architecture,
        session: session.getSnapshot(),
        replication: replication.getSnapshot(),
      };
    },
  };
}

function round(value) {
  return Math.round(value * 100) / 100;
}
