// keys.js — keyboard and mouse input, one job: remember what is pressed.
// Arrow keys and WASD move the thief; R restarts; Enter/Space starts from a
// screen; a mouse click sets a walk target the thief follows on his own.

export function createInput(canvas) {
  const held = new Set();
  const state = {
    up: false,
    down: false,
    left: false,
    right: false,
    restart: false,
    confirm: false,
    click: null, // {x, y} in canvas pixels, consumed by the game loop
  };

  function refresh() {
    state.up = held.has('ArrowUp') || held.has('KeyW');
    state.down = held.has('ArrowDown') || held.has('KeyS');
    state.left = held.has('ArrowLeft') || held.has('KeyA');
    state.right = held.has('ArrowRight') || held.has('KeyD');
  }

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if (event.code === 'KeyR') state.restart = true;
    if (event.code === 'Enter' || event.code === 'Space') state.confirm = true;
    held.add(event.code);
    refresh();
  });

  window.addEventListener('keyup', (event) => {
    held.delete(event.code);
    refresh();
  });

  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    state.click = {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  });

  return state;
}
