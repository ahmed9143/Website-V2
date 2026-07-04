// بيانات الربط بسوبابيز ورقم الواتساب الخاص بك
const SUPABASE_URL = "https://jllqgwdaistvbemoyxau.supabase.co";
const SUPABASE_KEY = "sb_publishable_hK-twI2WLlWEl9cKmJRFhg__HNIpZq7";
const WHATSAPP_NUMBER = '201032641038';

let products = [];
let cart = JSON.parse(localStorage.getItem('it_pro_cart')) || {};
let currentCategoryFilter = 'all';

// دالة جلب المنتجات الحية من سوبابيز (متوافقة مع الحقول الحالية في جدولك)
async function fetchProductsFromSupabase() {
  const grid = document.getElementById('prodGrid');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) throw new Error("فشل اتصال سوبابيز");
    
    products = await response.json();
    renderProducts();
    updateCartUI();
  } catch (error) {
    console.error(error);
    if(grid) {
      grid.innerHTML = `<div class="no-results">تنبيه: تأكد من تفعيل سياسة القراءة الـ RLS (Select Policy) داخل جدول سوبابيز.</div>`;
    }
  }
}

// نظام التنقل داخل الصفحة الواحدة (SPA)
function navigateTo(pageId) {
  document.querySelectorAll('.page-view').forEach(page => page.classList.remove('active-page'));
  const targetPage = document.getElementById('page-' + pageId);
  if(targetPage) targetPage.classList.add('active-page');
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if(link.getAttribute('data-page') === pageId) link.classList.add('active');
  });
  
  document.getElementById('catNavMenu').classList.remove('mobile-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openGeneralWhatsApp() {
  const welcomeText = "مرحبًا IT Solutions Pro، أود الاستفسار عن الأنظمة المتكاملة وحجز موعد معاينة.";
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(welcomeText)}`, '_blank');
}

// عرض الكروت وقراءة البيانات بناءً على لقطة الشاشة image_925827.png
function renderProducts(searchQuery = '') {
  const grid = document.getElementById('prodGrid');
  if(!grid) return;
  
  let filtered = products;
  
  if (searchQuery.trim() !== '') {
    filtered = filtered.filter(p => (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }

  if(filtered.length === 0) {
    grid.innerHTML = `<div class="no-results">المعرض فارغ حالياً. اضغط على Insert في سوبابيز وضف أول منتج!</div>`;
    return;
  }

  grid.innerHTML = filtered.map((p) => `
    <div class="prod-card">
      <div class="prod-img-box">
        ${p.image_url ? `<img src="${p.image_url}" alt="${p.title}">` : `
          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
            <rect x="3" y="7" width="18" height="11" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        `}
      </div>
      <div class="prod-body">
        <div class="prod-cat">أجهزة معتمدة</div>
        <div class="prod-name">${p.title || 'منتج بدون عنوان'}</div>
        <div class="prod-price-row">
          <div class="prod-price">${Number(p.price || 0).toLocaleString('ar-EG')} ج.م</div>
          <button class="add-btn" aria-label="إضافة إلى السلة" onclick="addToCart(${p.id}, this)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function executeSearch() {
  const query = document.getElementById('mainSearchInput').value;
  navigateTo('products');
  renderProducts(query);
}

// إعدادات عربة التسوق
function addToCart(id, btn) {
  cart[id] = (cart[id] || 0) + 1;
  saveCartAndRefresh();
  
  const originalHTML = btn.innerHTML;
  btn.style.background = '#1fae6b';
  btn.innerHTML = '✓';
  setTimeout(() => { btn.style.background = ''; btn.innerHTML = originalHTML; }, 800);
}

function changeQty(id, delta) {
  if(cart[id]) {
    cart[id] += delta;
    if(cart[id] <= 0) delete cart[id];
    saveCartAndRefresh();
  }
}

function removeFromCart(id) {
  delete cart[id];
  saveCartAndRefresh();
}

function saveCartAndRefresh() {
  localStorage.setItem('it_pro_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  let totalCount = 0, totalPrice = 0;
  const container = document.getElementById('cartItemsContainer');
  const formDetails = document.getElementById('cartFormDetails');
  
  Object.keys(cart).forEach(id => {
    const product = products.find(p => p.id == id);
    if(product) {
      totalCount += cart[id];
      totalPrice += ((product.price || 0) * cart[id]);
    }
  });
  
  document.getElementById('cartCountBadge').innerText = totalCount;
  document.getElementById('cartTotalHeader').innerText = totalPrice.toLocaleString('ar-EG') + ' ج.م';
  document.getElementById('cartDrawerTotal').innerText = totalPrice.toLocaleString('ar-EG') + ' ج.م';
  
  if(totalCount === 0) {
    container.innerHTML = '<div class="cart-empty-msg">سلة المشتريات فارغة حالياً.</div>';
    if(formDetails) formDetails.style.display = "none";
  } else {
    if(formDetails) formDetails.style.display = "block";
    container.innerHTML = Object.keys(cart).map(id => {
      const p = products.find(prod => prod.id == id);
      if(!p) return '';
      return `
        <div class="cart-item">
          <div class="cart-item-details">
            <div class="cart-item-title">${p.title || 'منتج'}</div>
            <div class="cart-item-price">${((p.price || 0) * cart[id]).toLocaleString('ar-EG')} ج.م</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="changeQty(${p.id}, -1)">-</button>
              <span>${cart[id]}</span>
              <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
            </div>
          </div>
          <button class="remove-item" onclick="removeFromCart(${p.id})">حذف</button>
        </div>
      `;
    }).join('');
  }
}

function checkoutViaWhatsApp() {
  let keys = Object.keys(cart);
  if(keys.length === 0) return alert("السلة فارغة!");
  
  const name = document.getElementById('clientName').value;
  const phone = document.getElementById('clientPhone').value;
  const city = document.getElementById('clientCity').value;
  const address = document.getElementById('clientAddress').value;
  
  if(!name || !phone || !city || !address) {
    return alert("برجاء ملء بيانات التوصيل الموضحة بالسلة أولاً!");
  }
  
  let msg = "🛒 *طلب أنظمة وأجهزة من موقع IT Solutions*\n";
  msg += "---------------------------------------\n";
  msg += `👤 *العميل:* ${name}\n`;
  msg += `📞 *الهاتف:* ${phone}\n`;
  msg += `📍 *العنوان:* ${city} - ${address}\n`;
  msg += "---------------------------------------\n\n";
  
  let total = 0;
  keys.forEach(id => {
    const p = products.find(prod => prod.id == id);
    if(p) {
      const qty = cart[id];
      total += (p.price || 0) * qty;
      msg += `▪️ *${p.title}*\n   العدد: ${qty} | الإجمالي: ${((p.price || 0) * qty).toLocaleString('ar-EG')} ج.م\n\n`;
    }
  });
  
  msg += "---------------------------------------\n";
  msg += `💰 *الإجمالي النهائي:* ${total.toLocaleString('ar-EG')} ج.م`;
  
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

function sendStructuredForm() {
  const name = document.getElementById('contactName').value;
  const details = document.getElementById('contactDetails').value;
  if(!name || !details) return alert("برجاء ملء البيانات أولاً.");
  
  let msg = `🏛️ *طلب دراسة مقايسة لموقع جديد*\n\n*الجهة:* ${name}\n*التفاصيل والمساحة:* ${details}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

// تشغيل الأحداث عند اكتمال بناء الصفحة
document.addEventListener('DOMContentLoaded', () => {
  fetchProductsFromSupabase();
  
  document.getElementById('mainSearchInput').addEventListener('keyup', executeSearch);

  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  
  document.getElementById('cartTriggerBtn').addEventListener('click', () => { drawer.classList.add('open'); overlay.classList.add('open'); });
  document.getElementById('closeCartBtn').addEventListener('click', () => { drawer.classList.remove('open'); overlay.classList.remove('open'); });
  overlay.addEventListener('click', () => { drawer.classList.remove('open'); overlay.classList.remove('open'); });
  
  document.getElementById('checkoutWhatsappBtn').addEventListener('click', checkoutViaWhatsApp);
  document.getElementById('menuToggle').addEventListener('click', () => { document.getElementById('catNavMenu').classList.toggle('mobile-open'); });

  // تبديل المظهر
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('it_theme', theme);
  });
});

// أنيميشن عشوائي تفاعلي لشبكة الواجهة الرسمية الخلفية
(function(){
  const svg = document.getElementById('netsvg'); if(!svg) return;
  const linksG = svg.querySelector('.links'), nodesG = svg.querySelector('.nodes');
  const pts = [[60,80],[210,40],[350,90],[110,190],[260,170],[380,230],[70,300],[210,340],[330,330]];
  const edges = [[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5],[3,6],[4,7],[5,8],[6,7],[7,8]];

  edges.forEach(([a,b])=>{
    const [x1,y1]=pts[a], [x2,y2]=pts[b];
    const l = document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',x1); l.setAttribute('y1',y1); l.setAttribute('x2',x2); l.setAttribute('y2',y2); l.setAttribute('class','link');
    linksG.appendChild(l);
  });
  pts.forEach((p,i)=>{
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',p[0]); c.setAttribute('cy',p[1]); c.setAttribute('r', 5);
    c.setAttribute('class','node' + (i%3===0 ? ' node-orange' : ''));
    nodesG.appendChild(c);
  });
})();