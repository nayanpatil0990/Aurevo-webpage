/* DealNest: storefront + admin panel (add / update / delete, saved in localStorage) */
const KEY = 'dealnest_products_v1';
const PASS = '@Manish99'; // CHANGE THIS. Front-end only, so it is a convenience lock, not real security.
const CUR = '$';         // currency symbol shown on prices

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => CUR + Number(n || 0).toFixed(2);
const stars = r => { const n = Math.round(r || 0); return '★'.repeat(n) + '☆'.repeat(5 - n); };
const PH = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" fill="#94a3b8" font-size="28" text-anchor="middle">No image</text></svg>');
const IN = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-amber-400';

// Demo products: replace image/link with your own in the admin panel
const seed = [
  ['Wireless ANC Headphones', 'Audio', 89.99, 149.99, 4.6, 'Over-ear comfort, 40-hour battery and deep, punchy bass.'],
  ['Smart Fitness Watch', 'Wearables', 59.99, 99.99, 4.4, 'Heart-rate, sleep tracking and a 14-day battery.'],
  ['Portable Bluetooth Speaker', 'Audio', 34.99, 49.99, 4.5, 'Waterproof, pocket-sized sound with 12 hours of playtime.'],
  ['Ergonomic Office Chair', 'Home', 179, 249, 4.7, 'Lumbar support and breathable mesh for long work days.'],
  ['4K Action Camera', 'Gadgets', 79.99, 129.99, 4.3, 'Stabilised 4K video with a waterproof case included.'],
  ['Robot Vacuum Cleaner', 'Home', 149.99, 229.99, 4.5, 'Smart room mapping, strong suction and app control.'],
  ['Mechanical Keyboard', 'Gadgets', 49.99, 69.99, 4.6, 'Hot-swappable switches with clean RGB lighting.'],
  ['5L Digital Air Fryer', 'Home', 64.99, 89.99, 4.8, 'Crispy meals with little oil and 8 one-touch presets.']
].map((a, i) => ({
  id: 's' + i, name: a[0], cat: a[1], price: a[2], old: a[3], rating: a[4], desc: a[5],
  img: 'https://picsum.photos/seed/dealnest' + i + '/600/450',
  link: 'https://example.com/product-' + i + '?ref=YOUR_ID'
}));

let products = load(), cat = 'All', q = '', authed = false;

function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(d)) return d; } catch (e) {}
  return JSON.parse(JSON.stringify(seed));
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(products)); }
  catch (e) { alert('Could not save: browser storage is blocked.'); }
}

/* ---------- Storefront ---------- */
const off = p => (p.old > p.price ? Math.round(100 - (p.price / p.old) * 100) : 0);

const card = p => `
<article class="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl">
  <div class="relative">
    <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" onerror="this.onerror=null;this.src=PH" class="h-48 w-full bg-slate-200 object-cover">
    ${off(p) ? `<span class="absolute left-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-extrabold text-white">-${off(p)}%</span>` : ''}
  </div>
  <div class="flex flex-1 flex-col p-4">
    <span class="text-sm font-bold text-rose-600">${esc(p.cat)}</span>
    <h3 class="mt-1 font-bold leading-snug">${esc(p.name)}</h3>
    <p class="mt-1 text-sm text-amber-500" aria-label="Rating ${p.rating || 0} out of 5">${stars(p.rating)} <span class="text-slate-400">${p.rating ? Number(p.rating).toFixed(1) : ''}</span></p>
    <p class="mt-2 line-clamp-2 text-sm text-slate-500">${esc(p.desc)}</p>
    <div class="mt-auto pt-4">
      <span class="text-2xl font-black">${money(p.price)}</span>
      ${off(p) ? `<s class="ml-1 text-sm text-slate-400">${money(p.old)}</s>` : ''}
    </div>
    <a href="${/^https?:\/\//i.test(p.link) ? esc(p.link) : '#'}" target="_blank" rel="sponsored nofollow noopener noreferrer" class="mt-3 block rounded-xl bg-amber-400 py-2.5 text-center font-extrabold text-slate-900 hover:bg-amber-300">View deal</a>
    <span class="mt-2 block text-center text-xs text-slate-400">Affiliate link. Price may change.</span>
  </div>
</article>`;

function renderShop() {
  const cats = ['All', ...new Set(products.map(p => p.cat).filter(Boolean))];
  if (!cats.includes(cat)) cat = 'All';
  $('#chips').innerHTML = cats.map(c =>
    `<button data-cat="${esc(c)}" class="rounded-full px-4 py-1.5 text-sm font-semibold ${c === cat ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white hover:bg-slate-100'}">${esc(c)}</button>`).join('');
  const list = products.filter(p => (cat === 'All' || p.cat === cat) &&
    [p.name, p.cat, p.desc].join(' ').toLowerCase().includes(q));
  $('#grid').innerHTML = list.map(card).join('');
  $('#empty').classList.toggle('hidden', list.length > 0);
  $('#count').textContent = list.length + (list.length === 1 ? ' product' : ' products');
  const best = Math.max(0, ...products.map(off));
  $('#best').textContent = best + '%';
  $('#badge').classList.toggle('hidden', !best);
}

$('#search').oninput = e => { q = e.target.value.trim().toLowerCase(); renderShop(); };
$('#chips').onclick = e => { const b = e.target.closest('[data-cat]'); if (b) { cat = b.dataset.cat; renderShop(); } };

/* ---------- Admin panel ---------- */
const FIELDS = [
  ['name', 'Product name', 'text', 1], ['cat', 'Category', 'text', 1],
  ['price', 'Price', 'number', 1], ['old', 'Old price (optional)', 'number', 0],
  ['rating', 'Rating 0 to 5 (optional)', 'number', 0], ['img', 'Image URL (optional)', 'url', 0],
  ['link', 'Affiliate link', 'url', 1]
];
$('#fields').innerHTML = FIELDS.map(([k, l, t, r]) =>
  `<label class="block text-sm font-semibold">${l}${r ? ' *' : ''}<input name="${k}" type="${t}" ${r ? 'required' : ''} ${t === 'number' ? 'step="0.01" min="0"' : ''} class="${IN}"></label>`).join('');

function renderAdmin() {
  $('#pcount').textContent = products.length;
  $('#plist').innerHTML = products.map(p => `
    <li class="flex items-center gap-3 py-3">
      <img src="${esc(p.img)}" alt="" onerror="this.onerror=null;this.src=PH" class="h-14 w-14 rounded-lg bg-slate-200 object-cover">
      <div class="min-w-0 flex-1">
        <p class="truncate font-semibold">${esc(p.name)}</p>
        <p class="text-sm text-slate-500">${esc(p.cat)} <span class="ml-2 font-semibold text-slate-700">${money(p.price)}</span></p>
      </div>
      <button data-edit="${esc(p.id)}" class="text-sm font-semibold text-indigo-600">Edit</button>
      <button data-del="${esc(p.id)}" class="text-sm font-semibold text-red-600">Delete</button>
    </li>`).join('') || '<li class="py-6 text-center text-sm text-slate-500">No products yet. Add your first one on the left.</li>';
}

function resetForm() {
  const f = $('#pform'); f.reset(); f.elements.pid.value = '';
  $('#ftitle').textContent = 'Add product'; $('#save').textContent = 'Add product';
  $('#cancel').classList.add('hidden');
}

function editProduct(id) {
  const p = products.find(x => x.id === id); if (!p) return;
  const f = $('#pform').elements;
  f.pid.value = p.id;
  ['name', 'cat', 'price', 'old', 'rating', 'img', 'link', 'desc'].forEach(k => { f[k].value = p[k] || ''; });
  $('#ftitle').textContent = 'Edit product'; $('#save').textContent = 'Update product';
  $('#cancel').classList.remove('hidden'); $('#admin').scrollTo(0, 0);
}

// Add (insert) or update
$('#pform').onsubmit = e => {
  e.preventDefault();
  const fd = new FormData(e.target), g = k => String(fd.get(k) || '').trim();
  if (!/^https?:\/\//i.test(g('link'))) return alert('The affiliate link must start with http:// or https://');
  const p = {
    id: g('pid') || Date.now().toString(36), name: g('name'), cat: g('cat'),
    price: +g('price') || 0, old: +g('old') || 0, rating: Math.min(5, +g('rating') || 0),
    img: g('img'), link: g('link'), desc: g('desc')
  };
  const i = products.findIndex(x => x.id === p.id);
  if (i < 0) products.unshift(p); else products[i] = p;
  save(); resetForm(); renderShop(); renderAdmin();
};

// Edit / delete
$('#plist').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.edit) editProduct(b.dataset.edit);
  if (b.dataset.del && confirm('Delete this product?')) {
    products = products.filter(x => x.id !== b.dataset.del);
    if ($('#pform').elements.pid.value === b.dataset.del) resetForm();
    save(); renderShop(); renderAdmin();
  }
};
$('#cancel').onclick = resetForm;
$('#reset').onclick = () => {
  if (confirm('Replace all products with the demo data?')) {
    products = JSON.parse(JSON.stringify(seed)); save(); resetForm(); renderShop(); renderAdmin();
  }
};
$('#copyJson').onclick = () => {
  const t = JSON.stringify(products, null, 2);
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject())
    .then(() => alert('Product JSON copied.')).catch(() => prompt('Copy your product JSON:', t));
};

/* ---------- Login, modals ---------- */
function showAdmin() {
  $('#admin').classList.remove('hidden');
  $('#login').classList.toggle('hidden', authed);
  $('#dash').classList.toggle('hidden', !authed);
  $('#logout').classList.toggle('hidden', !authed);
}
$('#openAdmin').onclick = showAdmin;
$('#logout').onclick = () => { authed = false; showAdmin(); };
$('#login').onsubmit = e => {
  e.preventDefault();
  if ($('#pass').value === PASS) { authed = true; $('#pass').value = ''; $('#loginErr').classList.add('hidden'); showAdmin(); }
  else $('#loginErr').classList.remove('hidden');
};

document.addEventListener('click', e => {
  const o = e.target.closest('[data-open]'); if (o) $('#' + o.dataset.open).classList.remove('hidden');
  if (e.target.closest('[data-close]') || e.target.id === 'terms') e.target.closest('#terms,#admin').classList.add('hidden');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('#terms,#admin').forEach(m => m.classList.add('hidden'));
});

/* ---------- Init ---------- */
$('#yr').textContent = new Date().getFullYear();
renderShop();
renderAdmin();
