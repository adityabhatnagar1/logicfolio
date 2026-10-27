// Block / gate view toggle on component pages: plain buttons, no motion.
document.querySelectorAll<HTMLElement>('[data-circuit]').forEach((root) => {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-circuit-view]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-circuit-panel]')];
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const view = button.dataset.circuitView;
      for (const b of buttons) b.setAttribute('aria-pressed', b === button ? 'true' : 'false');
      for (const p of panels) p.hidden = p.dataset.circuitPanel !== view;
    });
  }
});

export {};
