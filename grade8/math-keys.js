/* ───────────────────────────────────────────────────────────────
   MATH KEYS (Nov 23, 2026, Zach: "buttons for notation issues such as exponents, radicals, and any other
   similar entry or notation issues"). A small row of tap buttons under every typed answer box on a
   practice-engine page: the symbols students cannot find on a Chromebook keyboard, chosen per section.
   Tapping a key types it where the cursor is; the page's own checker still grades the answer.

     window.PRACTICE.data.secs[i].keys = ['neg', 'frac', 'exp', 'root', 'ineq']   (any subset, any order)
       neg   −   types -            frac  /   fraction bar          exp   xⁿ  types ^ (2^5 means 2⁵)
       root  √   square root        cube  ∛   cube root             ineq  <  >  ≤  ≥
     Every row ends with ⌫ Erase. A section with no `keys` gets no row (tap-choice problems never get one).
   Loaded by the page after practice-engine.js:  <script src="math-keys.js?v=…"></script>
   The step-by-step workspace (step-work.js) has its own keys; window.SW_KEYS = 'always' keeps them on screen
   on every device (its default hides the basic keys when the device has a real keyboard).
   ─────────────────────────────────────────────────────────────── */
(function () {
  if (window.__mathKeys) return; window.__mathKeys = true;
  var DEF = {
    neg: ['−', '-', 'negative sign'], frac: ['/', '/', 'fraction bar'], exp: ['xⁿ', '^', 'exponent (type the power after ^)'],
    root: ['√', '√', 'square root'], cube: ['∛', '∛', 'cube root'],
    ineq: [['<', '<', 'less than'], ['>', '>', 'greater than'], ['≤', '≤', 'less than or equal to'], ['≥', '≥', 'greater than or equal to']]
  };
  var css = document.createElement('style');
  css.textContent =
    '.mk-row{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px;align-items:center}' +
    '.mk-row .mk-l{font:600 12px/1.2 Inter,system-ui,sans-serif;color:#5B6475;margin-right:2px}' +
    '.mk-row button{min-width:44px;height:44px;padding:0 10px;border:1.5px solid #1E2D4F;border-radius:8px;background:#fff;color:#1E2D4F;' +
    'font:600 17px/1 "JetBrains Mono",ui-monospace,monospace;cursor:pointer}' +
    '.mk-row button:hover{background:#FFF6D6}.mk-row button:active{transform:translateY(1px)}' +
    '.mk-row button.mk-bs{font:600 13px/1 Inter,system-ui,sans-serif}' +
    '@media print{.mk-row{display:none}}';
  document.head.appendChild(css);

  function put(inp, text) {
    var s = inp.selectionStart, e = inp.selectionEnd, v = inp.value;
    if (s == null || document.activeElement !== inp) { s = e = v.length; }
    if (text === null) {                                   // erase one character (or the selection)
      if (s === e && s > 0) s--;
      inp.value = v.slice(0, s) + v.slice(e); e = s;
    } else {
      inp.value = v.slice(0, s) + text + v.slice(e); e = s + text.length;
    }
    try { inp.focus({ preventScroll: true }); } catch (x) { inp.focus(); }
    try { inp.setSelectionRange(e, e); } catch (x) { }
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function keysFor(names) {
    var out = [];
    (names || []).forEach(function (n) { var d = DEF[n]; if (!d) return; (Array.isArray(d[0]) ? d : [d]).forEach(function (k) { out.push(k); }); });
    return out;
  }
  function attach(inp, names) {
    if (inp.__mk) return; var keys = keysFor(names); if (!keys.length) return; inp.__mk = true;
    var row = document.createElement('div'); row.className = 'mk-row'; row.setAttribute('aria-label', 'Math keys');
    row.innerHTML = '<span class="mk-l">Tap to type:</span>';
    keys.concat([['⌫ Erase', null, 'Erase one character']]).forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = k[0]; if (k[1] === null) b.className = 'mk-bs';
      b.setAttribute('aria-label', k[1] === null ? k[2] : 'Type ' + k[2]);
      b.addEventListener('mousedown', function (ev) { ev.preventDefault(); });   // keep the cursor in the box
      b.addEventListener('click', function () { put(inp, k[1]); });
      row.appendChild(b);
    });
    var host = inp.closest('.pr-row') || inp;
    host.parentNode.insertBefore(row, host.nextSibling); row.__inp = inp;
  }
  function mount() {
    var D = window.PRACTICE; if (!D || !D.data) return;
    D.data.secs.forEach(function (sec, si) {
      if (!sec.keys || !sec.keys.length) return;
      sec.probs.forEach(function (p) {
        var card = document.getElementById('s' + si + 'p' + p.n); if (!card) return;
        var inp = card.querySelector('.pr-in'); if (!inp || inp.hidden || inp.classList.contains('ta-hid') || inp.dataset.taMounted) return;   // tap-choice problems keep no box (tap-answers.js)
        if (card.querySelector('.ik-row')) return;                                        // the inequality bar already covers this box
        attach(inp, sec.keys);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  window.MathKeys = { mount: mount, attach: attach };
})();
