import './styles.css';
import { createGame } from './game/createGame.js';
import { createHudOverlay } from './ui/createHudOverlay.js';

const root = document.querySelector('#root');

if (!(root instanceof HTMLElement)) {
  throw new Error('Root element #root was not found.');
}

root.className = 'app-shell';
root.append(createHudOverlay());

const game = createGame(root);
game.start();
