import './styles.css';
import { createGame } from './game/createGame.js';
import { createHudOverlay } from './ui/createHudOverlay.js';

const root = document.querySelector('#root');

if (!(root instanceof HTMLElement)) {
  throw new Error('Root element #root was not found.');
}

const hud = createHudOverlay();
root.className = 'app-shell';
root.append(hud.element);

const game = createGame(root, {
  onStateChange: hud.update,
});
game.start();
