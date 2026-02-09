// main.js
// Coffee section on top, Pastries (renamed from Bakery), then Dessert
// Images can be URLs or local filenames (.jpg/.png/.gif)
// Buyer phone required, delivery address for Delivery option
// Estimated time only (no countdown), orders saved to localStorage
// Shows buyer phone + NOX phone (driver phone) in orders

const NOX_PHONE = '+1 (555) 123-4567';
const ORDERS_KEY = 'nox_orders_v1';
const CART_KEY = 'nox_cart_v1';

const PRODUCTS = [
  // Coffee
  { id: 'espresso', name: 'Espresso', price: 2.50, desc: 'Bold, rich, and velvety — our signature single-origin espresso.', category: 'Coffee', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop' },
  { id: 'cappuccino', name: 'Cappuccino', price: 3.75, desc: 'Espresso with steamed milk and a rich, foamy top.', category: 'Coffee', image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=800&auto=format&fit=crop' },
  { id: 'americano', name: 'Americano', price: 2.95, desc: 'Espresso diluted with hot water — smooth and classic.', category: 'Coffee', image: 'https://images.unsplash.com/photo-1459257868276-5e65389e0f3f?q=80&w=800&auto=format&fit=crop' },
  { id: 'latte', name: 'Latte', price: 4.00, desc: 'Silky steamed milk balanced with a bright espresso shot.', category: 'Coffee', image: 'https://images.unsplash.com/photo-1510627498534-cf7e9002facc?q=80&w=800&auto=format&fit=crop' },
  { id: 'coldbrew', name: 'Cold Brew', price: 3.75, desc: 'Slow-steeped for a smooth, less acidic cup.', category: 'Coffee', image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop' },

  // Pastries (renamed from Bakery)
  { id: 'croissant', name: 'Croissant', price: 3.25, desc: 'Buttery, flaky, and baked fresh each morning.', category: 'Pastries', image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=800&auto=format&fit=crop' },
  { id: 'buttercookie', name: 'Butter Cookie', price: 1.50, desc: 'Classic buttery cookie, crisp edges and tender center.', category: 'Pastries', image: 'https://images.unsplash.com/photo-1548438293-8b2c6d8b6b16?q=80&w=800&auto=format&fit=crop' },
  { id: 'chococookie', name: 'Chocolate Cookie', price: 1.75, desc: 'Rich chocolate cookie with melty centers.', category: 'Pastries', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop' },
  { id: 'matchacookie', name: 'Matcha Cookie', price: 1.85, desc: 'Subtly sweet cookie with premium matcha green tea.', category: 'Pastries', image: 'https://images.unsplash.com/photo-1542834369-f10ebf06d3cb?q=80&w=800&auto=format&fit=crop' },

  // Dessert
  { id: 'cipriani-meringue', name: 'Cipriani Meringue', price: 4.75, desc: 'Light Italian meringue dessert — crisp outside, soft inside.', category: 'Dessert', image: 'https://images.unsplash.com/photo-1551882547-ff61c2f39f9b?q=80&w=800&auto=format&fit=crop' },
  { id: 'darkforest', name: 'Dark Forest Cake', price: 5.50, desc: 'Decadent dark chocolate cake layered with cherries and cream.', category: 'Dessert', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop' },
  { id: 'redvelvet', name: 'Red Velvet Slice', price: 4.95, desc: 'Classic red velvet with cream cheese frosting.', category: 'Dessert', image: 'https://images.unsplash.com/photo-1533777324565-a040eb52fac2?q=80&w=800&auto=format&fit=crop' }
];

const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="100%" height="100%" fill="#111"/><text x="50%" y="50%" fill="#c79a5b" font-family="Arial" font-size="20" text-anchor="middle" dy="8">NO IMAGE</text></svg>`);

let CART = loadCart();
let ORDERS = loadOrders();

function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(CART)); }
function loadCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; } }
function saveOrders(){ localStorage.setItem(ORDERS_KEY, JSON.stringify(ORDERS)); }
function loadOrders(){ try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch(e){ return []; } }

const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
function formatPrice(n){ return '$' + n.toFixed(2); }

function resolveImageSrc(imgValue){
  if(!imgValue) return FALLBACK_IMAGE;
  const v = String(imgValue).trim();
  if(/^https?:\/\//i.test(v)) return v;
  if(/\.(jpe?g|png|gif)$/i.test(v)) return v;
  return FALLBACK_IMAGE;
}

function groupByCategory(items){
  const map = {};
  items.forEach(it => {
    const c = it.category || 'Uncategorized';
    if(!map[c]) map[c] = [];
    map[c].push(it);
  });
  return map;
}

const CATEGORY_ORDER = ['Coffee','Pastries','Dessert'];

function orderedCategories(grouped){
  const known = [];
  CATEGORY_ORDER.forEach(c => { if(grouped[c]) known.push(c); });
  Object.keys(grouped).sort().forEach(c => { if(!known.includes(c)) known.push(c); });
  return known;
}

function renderProductsGrouped(){
  const list = $('#product-list');
  list.innerHTML = '';
  const grouped = groupByCategory(PRODUCTS);
  const cats = orderedCategories(grouped);
  cats.forEach(cat=>{
    const section = document.createElement('section');
    section.className = 'category-section';
    section.innerHTML = `<h3 class="category-title">${cat}</h3>`;
    const grid = document.createElement('div');
    grid.className = 'category-grid';
    grouped[cat].forEach(p=>{
      const card = document.createElement('article');
      card.className = 'product';
      card.dataset.id = p.id;
      card.innerHTML = `
        <div class="category-badge">${p.category}</div>
        <div class="media"><img class="main-img" alt="${p.name}" loading="lazy"></div>
        <h3>${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="row"><div class="price">${formatPrice(p.price)}</div><div></div></div>
        <div class="row"><div class="action-row"><button class="btn add-to-cart" data-id="${p.id}"><span class="btn-text">Add to Cart</span><span class="btn-spinner" aria-hidden="true"></span></button></div></div>
      `;
      const imgEl = card.querySelector('.main-img');
      const src = resolveImageSrc(p.image);
      imgEl.src = src;
      imgEl.onerror = ()=>{ imgEl.onerror=null; imgEl.src = FALLBACK_IMAGE; };

      const addBtn = card.querySelector('.add-to-cart');
      addBtn.addEventListener('click', async ()=>{
        addBtn.classList.add('loading'); addBtn.disabled = true;
        await new Promise(r=>setTimeout(r,350));
        addToCart(p.id,1);
        addBtn.classList.remove('loading'); addBtn.disabled = false;
        document.getElementById('open-dashboard-link').click();
      });

      grid.appendChild(card);
    });
    section.appendChild(grid);
    list.appendChild(section);
  });
}

function addToCart(productId, qty=1){
  const prod = PRODUCTS.find(p=>p.id===productId);
  if(!prod) return;
  const existing = CART.find(i=>i.id===productId);
  if(existing) existing.qty += qty;
  else CART.push({ id:productId, qty, name:prod.name, price:prod.price, img:prod.image || '', category:prod.category });
  saveCart();
  renderCart();
}

function renderCart(){
  const cartItems = $('#cart-items');
  const summary = $('#cart-summary');
  const emptyNote = $('#cart-empty-note');
  cartItems.innerHTML = '';
  if(CART.length===0){ emptyNote.style.display=''; summary.hidden=true; renderOrdersList(); return; }
  emptyNote.style.display='none'; summary.hidden=false;
  CART.forEach(item=>{
    const row = document.createElement('div');
    row.className = 'cart-row';
    const prod = PRODUCTS.find(p=>p.id===item.id);
    const imgSrc = resolveImageSrc(prod && prod.image ? prod.image : '');
    row.innerHTML = `
      <img class="small-img" src="${imgSrc}" alt="${item.name}">
      <div class="cart-meta"><strong>${item.name}</strong><div class="muted">Unit: ${formatPrice(item.price)}</div></div>
      <div class="cart-controls">
        <div class="qty">
          <button class="cart-dec">−</button>
          <input type="number" min="1" value="${item.qty}" class="cart-qty-input">
          <button class="cart-inc">+</button>
        </div>
        <div class="muted cart-line-sub">${formatPrice(item.price * item.qty)}</div>
        <button class="btn ghost remove-item">Remove</button>
      </div>
    `;
    const dec = row.querySelector('.cart-dec');
    const inc = row.querySelector('.cart-inc');
    const input = row.querySelector('.cart-qty-input');
    const lineSub = row.querySelector('.cart-line-sub');
    const removeBtn = row.querySelector('.remove-item');

    function updateQty(){
      const newQty = Number(input.value);
      const cartItem = CART.find(c=>c.id===item.id);
      if(cartItem){ cartItem.qty = newQty; lineSub.textContent = formatPrice(cartItem.qty * cartItem.price); updateSummary(); saveCart(); }
    }
    dec.addEventListener('click', ()=>{ input.value = Math.max(1, Number(input.value)-1); updateQty(); });
    inc.addEventListener('click', ()=>{ input.value = Math.max(1, Number(input.value)+1); updateQty(); });
    input.addEventListener('input', ()=>{ if(!input.value || Number(input.value)<1) input.value = 1; updateQty(); });
    removeBtn.addEventListener('click', ()=>{ CART = CART.filter(c=>c.id!==item.id); saveCart(); renderCart(); });

    cartItems.appendChild(row);
  });
  updateSummary();
  renderOrdersList();
}

function computeTotals(discountType='none'){
  const subtotal = CART.reduce((s,i)=>s + i.price * i.qty, 0);
  let discountPercent = 0;
  if(discountType === 'pwd' || discountType === 'senior') discountPercent = 0.20;
  const discountAmount = subtotal * discountPercent;
  const taxable = subtotal - discountAmount;
  const tax = taxable * 0.08;
  const grand = taxable + tax;
  return { subtotal, discountAmount, tax, grand };
}

function updateSummary(){
  const totals = computeTotals(currentCheckoutState.discountType || 'none');
  $('#subtotal-amount').textContent = formatPrice(totals.subtotal);
  $('#tax-amount').textContent = formatPrice(totals.tax);
  $('#grandtotal-amount').textContent = formatPrice(totals.grand);
  $('#discount-amount').textContent = formatPrice(totals.discountAmount);
}

const modal = $('#checkout-modal');
let currentStep = 1;
let currentCheckoutState = { billingType:'Pickup', deliveryAddress:'', discountType:'none', buyerPhone:'' };

function openModal(){ modal.setAttribute('aria-hidden','false'); showStep(1); }
function closeModal(){ modal.setAttribute('aria-hidden','true'); }

function showStep(n){
  currentStep = n;
  const steps = Array.from(modal.querySelectorAll('.modal-step'));
  steps.forEach(s => s.style.display = s.dataset.step == n ? '' : 'none');
  if(n===1){
    modal.querySelectorAll('input[name="billingType"]').forEach(r=> r.checked = (r.value === currentCheckoutState.billingType));
    toggleDeliveryRow();
    $('#buyer-phone').value = currentCheckoutState.buyerPhone || '';
    $('#delivery-address').value = currentCheckoutState.deliveryAddress || '';
  }
  if(n===2) modal.querySelectorAll('input[name="discountType"]').forEach(r=> r.checked = (r.value === currentCheckoutState.discountType));
  if(n===3) updateReview();
}

function toggleDeliveryRow(){
  const row = $('#delivery-address-row');
  const val = modal.querySelector('input[name="billingType"]:checked').value;
  row.style.display = val === 'Delivery' ? '' : 'none';
}

function estimatedTimeText(billingType){
  if(billingType === 'Pickup') return 'Pickup: ~10–30 minutes';
  return 'Delivery: ~30–120 minutes';
}

function updateReview(){
  const reviewItems = $('#review-items');
  reviewItems.innerHTML = '';
  if(CART.length === 0){ reviewItems.textContent = 'Cart empty.'; return; }
  const ul = document.createElement('ul'); ul.style.margin='0 0 8px 16px';
  CART.forEach(i => {
    const li = document.createElement('li');
    li.innerHTML = `${i.qty} × ${i.name} — ${formatPrice(i.price)} = ${formatPrice(i.price * i.qty)}`;
    ul.appendChild(li);
  });
  reviewItems.appendChild(ul);
  const totals = computeTotals(currentCheckoutState.discountType || 'none');
  $('#review-subtotal').textContent = formatPrice(totals.subtotal);
  $('#review-discount').textContent = formatPrice(totals.discountAmount);
  $('#review-tax').textContent = formatPrice(totals.tax);
  $('#review-grand').textContent = formatPrice(totals.grand);
  $('#review-eta').textContent = estimatedTimeText(currentCheckoutState.billingType);
}

function confirmOrder(){
  const buyerPhone = ($('#buyer-phone') && $('#buyer-phone').value.trim()) || '';
  if(!buyerPhone){ alert('Please enter buyer phone.'); return; }
  currentCheckoutState.buyerPhone = buyerPhone;
  if(currentCheckoutState.billingType === 'Delivery'){
    const addr = ($('#delivery-address') && $('#delivery-address').value.trim()) || '';
    if(!addr){ alert('Please enter delivery address.'); return; }
    currentCheckoutState.deliveryAddress = addr;
  }

  const totals = computeTotals(currentCheckoutState.discountType || 'none');
  const order = {
    id: 'ord_' + Date.now(),
    items: CART.map(i => ({ id:i.id, name:i.name, qty:i.qty, price:i.price })),
    subtotal: totals.subtotal,
    discount: totals.discountAmount,
    tax: totals.tax,
    total: totals.grand,
    billingType: currentCheckoutState.billingType,
    deliveryAddress: currentCheckoutState.deliveryAddress || '',
    buyerPhone: currentCheckoutState.buyerPhone || '',
    driverPhone: NOX_PHONE,
    discountType: currentCheckoutState.discountType || 'none',
    estimatedTimeText: estimatedTimeText(currentCheckoutState.billingType),
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  };

  ORDERS.unshift(order);
  saveOrders();

  CART = [];
  saveCart();
  renderCart();

  showStep(4);
  $('#order-complete-message').innerHTML = `Your order is confirmed (${order.billingType}).`;
  $('#order-timer').textContent = order.estimatedTimeText;

  renderOrdersList();
}

function renderOrdersList(){
  let target = $('#orders-list');
  if(!target){
    const container = document.createElement('div');
    container.id = 'orders-section';
    container.style.marginTop = '22px';
    container.innerHTML = '<h3>Your Orders</h3><div id="orders-list" style="margin-top:8px;"></div>';
    const dashboardInner = document.querySelector('.dashboard-inner');
    dashboardInner.appendChild(container);
    target = $('#orders-list');
  }

  target.innerHTML = '';
  if(ORDERS.length === 0){ target.innerHTML = '<div class="form-note">No orders yet.</div>'; return; }

  ORDERS.forEach(o => {
    const el = document.createElement('div');
    el.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005))';
    el.style.padding = '12px';
    el.style.borderRadius = '10px';
    el.style.marginBottom = '10px';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div><strong>Order ${o.id}</strong><div style="color:var(--muted);font-size:0.95rem">${new Date(o.createdAt).toLocaleString()}</div></div>
        <div style="text-align:right"><div style="color:var(--muted)">Status: ${o.status}</div><div style="margin-top:6px;font-weight:700">${formatPrice(o.total)}</div></div>
      </div>
      <div style="margin-top:8px;"><div style="font-size:0.95rem;color:var(--muted)">Items:</div><ul style="margin:6px 0 0 18px;">${o.items.map(it => `<li>${it.qty} × ${it.name} — ${formatPrice(it.price)} = ${formatPrice(it.qty * it.price)}</li>`).join('')}</ul></div>
      <div style="display:flex;gap:12px;margin-top:10px;flex-wrap:wrap;">
        <div><strong>Buyer phone:</strong> <a href="tel:${o.buyerPhone}" style="color:var(--accent)">${o.buyerPhone}</a></div>
        <div><strong>Driver phone:</strong> <a href="tel:${o.driverPhone}" style="color:var(--accent)">${o.driverPhone}</a></div>
        <div><strong>ETA:</strong> ${o.estimatedTimeText}</div>
      </div>
      <div style="margin-top:10px;color:var(--muted);font-size:0.95rem;">${o.billingType === 'Delivery' ? `<div><strong>Delivery address:</strong> ${o.deliveryAddress}</div>` : `<div>Pickup</div>`}</div>
    `;
    target.appendChild(el);
  });
}

function wireModal(){
  modal.querySelectorAll('.modal-close, .modal-cancel, #done-close').forEach(b => b.addEventListener('click', ()=> closeModal()));
  $('#step1-next').addEventListener('click', ()=>{
    currentCheckoutState.billingType = modal.querySelector('input[name="billingType"]:checked').value;
    currentCheckoutState.deliveryAddress = ($('#delivery-address') && $('#delivery-address').value.trim()) || '';
    const bp = ($('#buyer-phone') && $('#buyer-phone').value.trim()) || '';
    currentCheckoutState.buyerPhone = bp;
    if(!currentCheckoutState.buyerPhone){ alert('Please enter buyer phone.'); return; }
    if(currentCheckoutState.billingType === 'Delivery' && !currentCheckoutState.deliveryAddress){ alert('Please enter delivery address.'); return; }
    showStep(2);
  });
  modal.querySelectorAll('input[name="billingType"]').forEach(r => r.addEventListener('change', toggleDeliveryRow));
  $('#step2-back').addEventListener('click', ()=> showStep(1));
  $('#step2-next').addEventListener('click', ()=> { currentCheckoutState.discountType = modal.querySelector('input[name="discountType"]:checked').value; showStep(3); });
  $('#step3-back').addEventListener('click', ()=> showStep(2));
  $('#confirm-order').addEventListener('click', ()=> confirmOrder());
}

function wireHeader(){
  const toggle = $('#nav-toggle');
  const nav = $('#main-nav');
  if(toggle && nav) toggle.addEventListener('click', ()=> { const expanded = toggle.getAttribute('aria-expanded') === 'true'; toggle.setAttribute('aria-expanded', String(!expanded)); nav.classList.toggle('open'); });
  $('#checkout-btn').addEventListener('click', openModal);
  $('#clear-cart').addEventListener('click', ()=> { if(!confirm('Clear cart?')) return; CART = []; saveCart(); renderCart(); });
}

document.addEventListener('DOMContentLoaded', ()=> {
  renderProductsGrouped();
  wireHeader();
  wireModal();
  renderCart();
  renderOrdersList();
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
  showStep(1);
});m
