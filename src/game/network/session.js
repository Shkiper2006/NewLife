import { PlayerRole, createRoleSyncState } from './roles.js';

export function createSessionState(config = {}) {
  const settings = {
    minPlayers: config.minPlayers ?? 2,
    maxPlayers: config.maxPlayers ?? 8,
    reconnectWindowSeconds: config.reconnectWindowSeconds ?? 45,
    sharedStory: config.sharedStory ?? true,
  };

  const players = new Map();
  const story = {
    chapterId: 'prologue',
    checkpointId: 'hospital_cradle',
    completedTriggers: [],
    pendingTriggers: ['survive-first-night', 'restore-frontier-beacon'],
  };

  function joinPlayer(player) {
    if (players.size >= settings.maxPlayers) {
      return { accepted: false, reason: 'session-full' };
    }

    players.set(player.id, freezePlayerRecord({
      role: player.role ?? PlayerRole.Engineer,
      status: 'connected',
      lives: player.lives ?? 1,
      latencyMs: player.latencyMs ?? 32,
      prediction: player.prediction ?? 'hybrid',
      ...player,
    }));
    return { accepted: true, player: players.get(player.id) };
  }

  function updatePlayer(playerId, patch) {
    const current = players.get(playerId);
    if (!current) {
      return null;
    }

    const nextStage = patch.stage ?? current.stage;
    const nextRole = patch.role ?? current.role;
    const roleSync = patch.roleSync ?? createRoleSyncState(nextRole, nextStage);
    const nextPlayer = freezePlayerRecord({
      ...current,
      ...patch,
      role: nextRole,
      stage: nextStage,
      roleSync,
    });
    players.set(playerId, nextPlayer);
    return nextPlayer;
  }

  function leavePlayer(playerId) {
    return updatePlayer(playerId, { status: 'disconnected', disconnectedAt: Date.now() });
  }

  function reconnectPlayer(playerId, latencyMs = 48) {
    return updatePlayer(playerId, { status: 'connected', latencyMs, disconnectedAt: null, reconnecting: false });
  }

  function respawnPlayer(playerId, checkpointId) {
    return updatePlayer(playerId, {
      status: 'connected',
      respawnState: { mode: 'checkpoint', checkpointId, approved: true },
      health: 100,
    });
  }

  function updateSharedStoryProgress(progress) {
    story.chapterId = progress.chapterId ?? story.chapterId;
    story.checkpointId = progress.checkpointId ?? story.checkpointId;
    story.completedTriggers = unique([...story.completedTriggers, ...(progress.completedTriggers ?? [])]);
    if (progress.pendingTriggers) {
      story.pendingTriggers = unique(progress.pendingTriggers);
    }
  }

  return {
    joinPlayer,
    updatePlayer,
    leavePlayer,
    reconnectPlayer,
    respawnPlayer,
    updateSharedStoryProgress,
    getSnapshot() {
      const roster = [...players.values()].sort((left, right) => left.joinOrder - right.joinOrder);
      const connectedPlayers = roster.filter((player) => player.status === 'connected').length;
      return {
        settings: { ...settings },
        connectedPlayers,
        roster,
        story: {
          chapterId: story.chapterId,
          checkpointId: story.checkpointId,
          completedTriggers: [...story.completedTriggers],
          pendingTriggers: [...story.pendingTriggers],
        },
      };
    },
  };
}

function freezePlayerRecord(player) {
  return Object.freeze({
    id: player.id,
    name: player.name,
    joinOrder: player.joinOrder ?? 0,
    stage: player.stage ?? 'Infant',
    role: player.role,
    roleSync: Object.freeze({
      role: player.roleSync?.role ?? player.role,
      gameplayFocus: player.roleSync?.gameplayFocus ?? '',
      bonuses: Object.freeze({ ...(player.roleSync?.bonuses ?? {}) }),
      syncedFields: Object.freeze([...(player.roleSync?.syncedFields ?? [])]),
    }),
    status: player.status,
    lives: player.lives,
    latencyMs: player.latencyMs,
    prediction: player.prediction,
    health: player.health ?? 100,
    respawnState: Object.freeze({ ...(player.respawnState ?? { mode: 'alive', checkpointId: null, approved: false }) }),
    disconnectedAt: player.disconnectedAt ?? null,
    reconnecting: player.reconnecting ?? false,
  });
}

function unique(values) {
  return [...new Set(values)];
}
