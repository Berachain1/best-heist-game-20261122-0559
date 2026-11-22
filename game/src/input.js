// The Midnight Vault — input: keyboard and mouse, one place.
// One job: track held keys, queue clicks, and turn pixels into room coordinates.

import { VIEW } from './config.js';

export function makeInput(canvas) {
  const keys = new Set();
  const pressed = new Set();
  let clickQueued = null;
  let mouse = { x: VIEW.w / 2, y: VIEW.h / 2 };

  function roomPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW.w,
      y: ((clientY - rect.top) / rect.height) * VIEW.h,
    };
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (!e.repeat) pressed.add(e.code);
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('mousemove', (e) => {
    mouse = roomPoint(e.clientX, e.clientY);
  });
  canvas.addEventListener('mousedown', (e) => {
    mouse = roomPoint(e.clientX, e.clientY);
    clickQueued = { x: mouse.x, y: mouse.y - VIEW.hud };
  });

  return {
    get up() {
      return keys.has('KeyW') || keys.has('ArrowUp');
    },
    get down() {
      return keys.has('KeyS') || keys.has('ArrowDown');
    },
    get left() {
      return keys.has('KeyA') || keys.has('ArrowLeft');
    },
    get right() {
      return keys.has('KeyD') || keys.has('ArrowRight');
    },
    get sneak() {
      return keys.has('ShiftLeft') || keys.has('ShiftRight');
    },
    mouse() {
      return mouse;
    },
    // Mouse position in room-local coordinates (HUD stripped).
    mouseRoom() {
      return { x: mouse.x, y: Math.max(0, mouse.y - VIEW.hud) };
    },
    consumeClick() {
      const c = clickQueued;
      clickQueued = null;
      return c;
    },
    consumeKey(code) {
      if (pressed.has(code)) {
        pressed.delete(code);
        return true;
      }
      return false;
    },
    consumeAnyKey() {
      if (pressed.size > 0) {
        pressed.clear();
        return true;
      }
      return clickQueued !== null && this.consumeClick() !== null;
    },
  };
}
