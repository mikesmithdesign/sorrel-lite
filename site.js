/* Sorrel Lite : trimmed engines for the one-page free template.
   Full theme (JSON-driven content, multipage price list, team page,
   filterable work gallery with lightbox, four colour packs) at
   https://mikesmithdesign.gumroad.com/l/sorrel-astro-theme */

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis;
if (!REDUCED && window.Lenis) {
  lenis = new Lenis({ lerp: .09 });
  (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
}

/* ---------- hours engine : decimal 24h, null = closed ----------
   Set your own hours here (day 0 = Sunday). */
const HOURS = { 0: null, 1: null, 2: [9, 18], 3: [9, 18], 4: [9, 20], 5: [9, 18], 6: [8.5, 16] };
const DAYNAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const NOW = new Date(), DAY = NOW.getDay(), HR = NOW.getHours() + NOW.getMinutes() / 60;
const TODAY = HOURS[DAY], IS_OPEN = !!TODAY && HR >= TODAY[0] && HR < TODAY[1];
const fmt = x => { const h = Math.floor(x), m = Math.round((x - h) * 60); return h + (m ? ':' + String(m).padStart(2, '0') : ''); };
function nextOpenDay() {
  for (let i = 1; i <= 7; i++) { const d = (DAY + i) % 7; if (HOURS[d]) return { d, name: DAYNAMES[d], at: HOURS[d][0] }; }
}

/* book section : today's row + open/closed card */
document.querySelectorAll('.hgroup').forEach(g => {
  const days = (g.dataset.days || '').split(',').map(Number);
  if (days.includes(DAY)) g.classList.add('today');
});
(function () {
  const stamp = document.getElementById('stamp');
  if (!stamp) return;
  let sub;
  if (IS_OPEN) sub = 'till ' + fmt(TODAY[1]) + ' today, call us';
  else if (TODAY && HR < TODAY[0]) sub = 'opens ' + fmt(TODAY[0]) + ' today';
  else { const n = nextOpenDay(); sub = 'back ' + n.name + ' at ' + fmt(n.at); }
  stamp.innerHTML = '<b>' + (IS_OPEN ? 'Open now' : 'Closed') + '</b><span>' + sub + '</span>';
})();

/* ---------- transparent header : solidify on scroll ---------- */
(function () {
  const topEl = document.querySelector('.top.top--trans');
  if (!topEl) return;
  const solidify = () => topEl.classList.toggle('scrolled', window.scrollY > 58);
  window.addEventListener('scroll', solidify, { passive: true });
  solidify();
})();

/* ---------- reveals (sparing) ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .16 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
if (REDUCED) document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));

/* ---------- services hover-swap ---------- */
(function () {
  const list = document.getElementById('svcList');
  if (!list) return;
  const imgs = document.querySelectorAll('#svcFig img');
  list.querySelectorAll('a').forEach(a => {
    a.addEventListener('mouseenter', () => {
      list.querySelectorAll('a').forEach(x => x.classList.toggle('on', x === a));
      imgs.forEach(im => im.classList.toggle('on', im.id === a.dataset.fig));
    });
  });
})();

/* ---------- booking form : native date floor + guard ---------- */
(function () {
  const form = document.getElementById('bookForm');
  if (!form) return;
  const date = document.getElementById('bfDate');
  date.min = new Date().toISOString().slice(0, 10);
  form.addEventListener('submit', e => {
    e.preventDefault();
    for (const f of [document.getElementById('bfName'), document.getElementById('bfPhone'), date]) {
      if (!f.value.trim() || !f.checkValidity()) { f.reportValidity && f.reportValidity(); return; }
    }
    form.style.display = 'none';
    document.getElementById('bookOk').classList.add('show');
  });
})();
