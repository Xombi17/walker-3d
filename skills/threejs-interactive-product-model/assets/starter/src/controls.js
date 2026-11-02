/**
 * Minimal control panel from a config:
 *   sliders: [{ id, label, min, max, step, value, unit }]
 *   toggles: [{ id, label, checked }]
 * Calls handlers.slider(id, value), handlers.toggle(id, checked), handlers.view(name), handlers.export().
 */
export function createControls(container, { title, sliders, toggles }, handlers) {
  const panel = document.createElement('aside');
  panel.className = 'control-panel';
  panel.innerHTML = `
    <h1>${title}</h1>
    ${sliders.map((s) => `
      <label class="slider"><span>${s.label}</span><output id="${s.id}-out"></output>
        <input type="range" id="${s.id}" min="${s.min}" max="${s.max}" step="${s.step}" value="${s.value}" /></label>`).join('')}
    ${toggles.map((t) => `
      <label class="switch"><input type="checkbox" id="${t.id}" ${t.checked ? 'checked' : ''} /><span class="track"></span><span>${t.label}</span></label>`).join('')}
    <div class="presets" role="group" aria-label="Camera presets">
      ${['front', 'side', 'threeQuarter', 'top'].map((v) => `<button type="button" class="button" data-view="${v}">${v === 'threeQuarter' ? '3/4' : v}</button>`).join('')}
    </div>
    <button type="button" class="button primary" id="export">Export GLB</button>
    <p class="status" id="status" role="status"></p>`;
  container.appendChild(panel);

  for (const s of sliders) {
    const input = panel.querySelector(`#${s.id}`);
    const out = panel.querySelector(`#${s.id}-out`);
    const show = () => (out.textContent = `${Number(input.value).toFixed(s.step < 1 ? 2 : 0)} ${s.unit ?? ''}`);
    input.addEventListener('input', () => {
      show();
      handlers.slider(s.id, Number(input.value));
    });
    show();
  }
  for (const t of toggles) {
    panel.querySelector(`#${t.id}`).addEventListener('change', (event) => handlers.toggle(t.id, event.target.checked));
  }
  panel.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => handlers.view(b.dataset.view)));
  panel.querySelector('#export').addEventListener('click', () => handlers.export());
  return { setStatus: (text) => (panel.querySelector('#status').textContent = text) };
}
