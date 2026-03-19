import { createGroundMesh } from '../entities/createGroundMesh.js';
import { createPlayerCapsuleMesh } from '../entities/createPlayerCapsuleMesh.js';
import { createMainCamera } from '../systems/createMainCamera.js';
import { configureLighting } from '../systems/configureLighting.js';
import { createIdentityMatrix, createModelMatrix, multiplyMatrices } from '../systems/math3d.js';
import { createSurvivalPrototype } from './createSurvivalPrototype.js';
import { getAgeStageScale } from './progression/ageStages.js';
import { createGameplayAccessController } from './progression/gameplayAccess.js';
import { createPlayerState } from './progression/playerState.js';
import { createNetworkRuntime } from './network/index.js';
import { createStoryCampaign } from './story/index.js';
import { createWorldState } from './world/index.js';

const vertexShaderSource = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

varying vec3 vColor;
varying vec3 vNormal;

void main() {
  mat3 normalMatrix = mat3(uModelMatrix);
  vColor = aColor;
  vNormal = normalize(normalMatrix * aNormal);
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec3 uAmbientLight;
uniform vec3 uDirectionalLight;
uniform vec3 uLightDirection;

varying vec3 vColor;
varying vec3 vNormal;

void main() {
  float diffuse = max(dot(normalize(vNormal), normalize(uLightDirection)), 0.0);
  vec3 lighting = uAmbientLight + (uDirectionalLight * diffuse);
  vec3 shadedColor = vColor * lighting;
  gl_FragColor = vec4(shadedColor, 1.0);
}
`;

export function createGame(container, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'game-canvas';
  container.prepend(canvas);

  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGL is not supported in this browser.');
  }

  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);

  const camera = createMainCamera();
  const lighting = configureLighting();
  const playerState = createPlayerState();
  const survival = createSurvivalPrototype(playerState);
  const gameplayAccess = createGameplayAccessController(playerState, () => survival.getDynamicEffects());
  const storyCampaign = createStoryCampaign(playerState);
  const worldState = createWorldState(playerState, storyCampaign);
  const networkRuntime = createNetworkRuntime(playerState);
  const meshes = [createGroundMesh(), createPlayerCapsuleMesh()];
  const gpuMeshes = meshes.map((mesh) => uploadMesh(gl, mesh));
  const uniforms = getUniformLocations(gl, program);
  const attributes = getAttributeLocations(gl, program);
  const syncHud = typeof options.onStateChange === 'function' ? options.onStateChange : () => {};

  let frameId = 0;
  let lastTime = performance.now();
  const startedAt = performance.now();
  const completedMilestones = new Set();

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = Math.floor(width * window.devicePixelRatio);
    canvas.height = Math.floor(height * window.devicePixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const emitHudState = (survivalSnapshot, networkSnapshot) => {
    const snapshot = playerState.getSnapshot();
    syncHud({
      player: snapshot,
      capabilities: gameplayAccess.getCapabilities(),
      access: gameplayAccess.describeChecks(),
      progression: playerState.evaluateStageProgression(),
      world: worldState.describeWorldSnapshot(),
      story: storyCampaign.getSnapshot(),
      survival: survivalSnapshot,
      network: networkSnapshot,
    });
  };

  const unlockDemoProgression = (elapsed) => {
    if (elapsed >= 1 && !completedMilestones.has('story-wake')) {
      completedMilestones.add('story-wake');
      storyCampaign.recordWorldEvent('wake-in-nursery');
      storyCampaign.recordWorldEvent('hear-code-blue');
    }

    if (elapsed >= 3 && !completedMilestones.has('infant-step-1')) {
      completedMilestones.add('infant-step-1');
      playerState.addExperience(40);
      playerState.addTutorialMilestone('basic-mobility');
      playerState.unlockSkill('crawl-balance');
      playerState.unlockSkill('squeeze-through-vents');
      storyCampaign.recordWorldEvent('escape-checkup-room');
      storyCampaign.recordWorldEvent('find-first-shortcut');
    }

    if (elapsed >= 6 && !completedMilestones.has('infant-step-2')) {
      completedMilestones.add('infant-step-2');
      playerState.addExperience(60);
      playerState.addTutorialMilestone('first-foraging-lesson');
      playerState.addInventoryItem('family-totem');
      storyCampaign.recordWorldEvent('survive-first-night');
      playerState.advanceAgeStage();
    }

    if (elapsed >= 8 && !completedMilestones.has('story-yards-1')) {
      completedMilestones.add('story-yards-1');
      storyCampaign.recordWorldEvent('find-safe-play-route');
      storyCampaign.recordWorldEvent('win-neighborhood-trust');
    }

    if (elapsed >= 10 && !completedMilestones.has('child-step-1')) {
      completedMilestones.add('child-step-1');
      playerState.addExperience(140);
      playerState.addTutorialMilestone('crafting-basics');
      playerState.unlockSkill('berry-foraging');
      playerState.unlockSkill('door-latch-reach');
      storyCampaign.recordWorldEvent('unlock-family-hideout');
      storyCampaign.recordWorldEvent('recover-courtyard-cache');
    }

    if (elapsed >= 13 && !completedMilestones.has('child-step-2')) {
      completedMilestones.add('child-step-2');
      playerState.addExperience(160);
      playerState.addTutorialMilestone('field-survival');
      playerState.addInventoryItem('apprentice-toolkit');
      storyCampaign.recordWorldEvent('earn-village-trust');
      storyCampaign.recordWorldEvent('stabilize-yard-shelter');
      playerState.advanceAgeStage();
    }

    if (elapsed >= 15 && !completedMilestones.has('story-district-1')) {
      completedMilestones.add('story-district-1');
      storyCampaign.recordWorldEvent('cross-first-checkpoint');
      storyCampaign.recordWorldEvent('meet-courier-faction');
      storyCampaign.recordWorldEvent('meet-watchers-network');
    }

    if (elapsed >= 17 && !completedMilestones.has('teen-step-1')) {
      completedMilestones.add('teen-step-1');
      playerState.addExperience(280);
      playerState.addTutorialMilestone('combat-discipline');
      playerState.unlockSkill('stone-weapon-mastery');
      playerState.unlockSkill('ledge-balance');
      playerState.unlockSkill('service-panel-access');
      storyCampaign.recordWorldEvent('trace-blackout-origin');
      storyCampaign.recordWorldEvent('discover-hidden-substation');
    }

    if (elapsed >= 20 && !completedMilestones.has('teen-step-2')) {
      completedMilestones.add('teen-step-2');
      playerState.addExperience(420);
      playerState.addTutorialMilestone('advanced-traversal');
      playerState.addInventoryItem('lineage-sigil');
      playerState.unlockSkill('control-center-clearance');
      storyCampaign.recordWorldEvent('restore-frontier-beacon');
      playerState.advanceAgeStage();
    }

    if (elapsed >= 22 && !completedMilestones.has('adult-control-center')) {
      completedMilestones.add('adult-control-center');
      storyCampaign.recordWorldEvent('assume-network-control');
      storyCampaign.recordWorldEvent('restore-water-pressure');
      storyCampaign.recordWorldEvent('bypass-security-grid');
      storyCampaign.recordWorldEvent('stabilize-district-services');
      storyCampaign.updateInfrastructure({
        power: 1,
        water: 1,
        communication: 1,
        defense: 1,
      });
      storyCampaign.recordWorldEvent('recover-city-archives');
    }

    if (elapsed >= 24 && !completedMilestones.has('adult-final-choice')) {
      completedMilestones.add('adult-final-choice');
      storyCampaign.recordWorldEvent('choose-city-future');
      storyCampaign.recordWorldEvent({ type: storyCampaign.StoryWorldEventType.SeasonalHook, id: 'season_branching_referendum' });
      if (storyCampaign.isFinalChoiceAvailable(storyCampaign.FinalFactionChoice.OpenTheCity)) {
        storyCampaign.chooseFinalFaction(storyCampaign.FinalFactionChoice.OpenTheCity);
      }
    }
  };

  const render = (time) => {
    const elapsed = (time - startedAt) / 1000;
    const deltaSeconds = Math.min((time - lastTime) / 1000, 0.25);
    lastTime = time;

    unlockDemoProgression(elapsed);
    const survivalSnapshot = survival.update(deltaSeconds);
    const worldSnapshot = worldState.describeWorldSnapshot();
    const storySnapshot = storyCampaign.getSnapshot();
    const networkSnapshot = networkRuntime.update({
      elapsedSeconds: elapsed,
      world: worldSnapshot,
      story: storySnapshot,
      survival: survivalSnapshot,
    });
    emitHudState(survivalSnapshot, networkSnapshot);

    resize();
    gl.clearColor(0.529, 0.714, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const snapshot = playerState.getSnapshot();
    const playerScale = getAgeStageScale(snapshot.stage);
    const playerHeightOffset = 1.08 * playerScale;
    const actionMultiplier = survivalSnapshot.effects.actionMultiplier;
    const bobStrength = 0.08 * playerScale * actionMultiplier;

    camera.position[0] = 5.5 + Math.sin(elapsed * 0.25) * 0.8;
    camera.target[1] = playerHeightOffset + Math.sin(elapsed * 0.5) * 0.05;

    gl.uniformMatrix4fv(uniforms.projectionMatrix, false, toFloat32(camera.getProjectionMatrix(canvas.width / canvas.height)));
    gl.uniformMatrix4fv(uniforms.viewMatrix, false, toFloat32(camera.getViewMatrix()));
    gl.uniform3fv(uniforms.ambientLight, lighting.ambient);
    gl.uniform3fv(uniforms.directionalLight, lighting.directionalColor);
    gl.uniform3fv(uniforms.lightDirection, lighting.direction);

    const identity = createIdentityMatrix();
    drawMesh(gl, gpuMeshes[0], attributes, uniforms, identity);

    const playerMatrix = multiplyMatrices(
      createModelMatrix({
        translation: [0, playerHeightOffset + Math.abs(Math.sin(elapsed * (1.2 + actionMultiplier))) * bobStrength, 0],
        rotationY: Math.sin(elapsed * 0.75 * Math.max(actionMultiplier, 0.35)) * 0.35,
        scale: [playerScale, playerScale, playerScale],
      }),
      createIdentityMatrix(),
    );
    drawMesh(gl, gpuMeshes[1], attributes, uniforms, playerMatrix);

    frameId = window.requestAnimationFrame(render);
  };

  return {
    start() {
      window.addEventListener('resize', resize);
      const survivalSnapshot = survival.getSnapshot();
      const networkSnapshot = networkRuntime.getSnapshot();
      emitHudState(survivalSnapshot, networkSnapshot);
      resize();
      render(performance.now());
    },
    destroy() {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(frameId);
      container.removeChild(canvas);
    },
  };
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Failed to allocate shader.');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Unknown shader compile error';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();

  if (!program) {
    throw new Error('Failed to allocate shader program.');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'Unknown program link error';
    throw new Error(message);
  }

  return program;
}

function uploadMesh(gl, mesh) {
  return {
    position: uploadAttribute(gl, mesh.vertices, 3),
    normal: uploadAttribute(gl, mesh.normals, 3),
    color: uploadAttribute(gl, mesh.colors, 3),
    count: mesh.vertices.length / 3,
  };
}

function uploadAttribute(gl, values, size) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error('Failed to allocate GPU buffer.');
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
  return { buffer, size };
}

function getUniformLocations(gl, program) {
  return {
    projectionMatrix: requireUniform(gl, program, 'uProjectionMatrix'),
    viewMatrix: requireUniform(gl, program, 'uViewMatrix'),
    modelMatrix: requireUniform(gl, program, 'uModelMatrix'),
    ambientLight: requireUniform(gl, program, 'uAmbientLight'),
    directionalLight: requireUniform(gl, program, 'uDirectionalLight'),
    lightDirection: requireUniform(gl, program, 'uLightDirection'),
  };
}

function getAttributeLocations(gl, program) {
  return {
    position: requireAttribute(gl, program, 'aPosition'),
    normal: requireAttribute(gl, program, 'aNormal'),
    color: requireAttribute(gl, program, 'aColor'),
  };
}

function requireUniform(gl, program, name) {
  const location = gl.getUniformLocation(program, name);
  if (!location) {
    throw new Error(`Uniform ${name} was not found.`);
  }
  return location;
}

function requireAttribute(gl, program, name) {
  const location = gl.getAttribLocation(program, name);
  if (location < 0) {
    throw new Error(`Attribute ${name} was not found.`);
  }
  return location;
}

function drawMesh(gl, mesh, attributes, uniforms, modelMatrix) {
  gl.uniformMatrix4fv(uniforms.modelMatrix, false, toFloat32(modelMatrix));
  bindAttribute(gl, mesh.position, attributes.position);
  bindAttribute(gl, mesh.normal, attributes.normal);
  bindAttribute(gl, mesh.color, attributes.color);
  gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
}

function bindAttribute(gl, attribute, location) {
  gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, attribute.size, gl.FLOAT, false, 0, 0);
}

function toFloat32(matrix) {
  return matrix instanceof Float32Array ? matrix : new Float32Array(matrix);
}
