/* Micro-animations from useanimations.com (react-useanimations, MIT), played with
   lottie-web so no React is needed. JSON lives in assets/anim/.

   Markup: <span class="anim" data-anim="checkBox"></span>
   Optional: data-color="#fff", data-loop, data-hover (replay on hover of the parent). */

const Anim = (() => {
  const cache = {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hexToRgba = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1];
  };
  // The source icons are black strokes/fills; repaint them in our palette.
  function recolor(node, rgba) {
    if (Array.isArray(node)) { node.forEach((n) => recolor(n, rgba)); return; }
    if (!node || typeof node !== 'object') return;
    if ((node.ty === 'st' || node.ty === 'fl') && node.c && Array.isArray(node.c.k) && typeof node.c.k[0] === 'number') {
      node.c.k = rgba;
    }
    Object.values(node).forEach((v) => { if (v && typeof v === 'object') recolor(v, rgba); });
  }

  function load(name) {
    cache[name] ??= fetch(`assets/anim/${name}.json`).then((r) => r.json());
    return cache[name];
  }

  async function mount(el) {
    if (el._anim || el._mounting || !window.lottie) return el._mounting;
    el._mounting = (async () => {
      const data = structuredClone(await load(el.dataset.anim));
      recolor(data, hexToRgba(el.dataset.color || '#214152'));
      const a = window.lottie.loadAnimation({
        container: el, renderer: 'svg', loop: el.hasAttribute('data-loop'),
        autoplay: el.hasAttribute('data-loop') && !reduce, animationData: data,
      });
      el._anim = a;
      el._last = data.op - 1;
      if (el.hasAttribute('data-hover')) {
        const host = el.closest(el.dataset.hover || 'button, summary, a') || el;
        host.addEventListener('mouseenter', () => replay(el));
      }
      if ('on' in el.dataset) set(el, el.dataset.on === 'true', false);
      else if (!el.hasAttribute('data-loop')) a.goToAndStop(el.dataset.rest === 'end' ? el._last : 0, true);
      return a;
    })();
    return el._mounting;
  }

  function mountAll(root = document) {
    return Promise.all([...root.querySelectorAll('[data-anim]')].map(mount));
  }

  // Toggle icons (radio, checkbox, search↔x): animate between first and last frame.
  function set(el, on, animate = true) {
    el.dataset.on = String(on);
    const a = el._anim;
    if (!a) return;
    if (el._state === on) return;
    const first = el._state === undefined;
    el._state = on;
    if (!animate || first || reduce) { a.goToAndStop(on ? el._last : 0, true); return; }
    a.playSegments(on ? [0, el._last] : [el._last, 0], true);
  }

  function replay(el, delay = 0) {
    const go = () => { if (!el._anim) return; if (reduce) { el._anim.goToAndStop(el._last, true); return; } el._anim.goToAndPlay(0, true); };
    if (el._anim) setTimeout(go, delay); else mount(el).then(() => setTimeout(go, delay));
  }

  return { mount, mountAll, set, replay };
})();
