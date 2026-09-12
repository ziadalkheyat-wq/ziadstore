const SYRIAN_POUND_PER_USD = 15000;
const SUGO_PRODUCT_ID = 6;
const SUGO_UNITS_PER_RATE = 10000;
const SUGO_SYRIAN_POUNDS_PER_RATE = 21300;
const SUGO_MARKUP = 1.01;
const SUGO_MIN_UNITS = 10000;
const SUGO_MAX_UNITS = 5000000;
const ZEINA_PRODUCT_ID = 7;
const ZEINA_SYRIAN_POUNDS_PER_RATE = 16300;
const ZEINA_MARKUP = 1.01;
const ZEINA_MIN_UNITS = 10000;
const ZEINA_MAX_UNITS = 5000000;
const MEYO_PRODUCT_ID = 8;
const MEYO_OPTIONS = [
  { id: 801, label: '450', price: 7436 },
  { id: 802, label: '980', price: 15221 }
];
const MEYO_MARKUP = 1.01;
const MIN_PRODUCT_PRICE = 10000;
const products = [
  { id: 1, name: 'اشتراك Netflix Premium', description: 'شهر كامل • حساب خاص', price: 85000, category: 'اشتراكات', art: 'N', artClass: 'art-netflix', image: 'https://ui-avatars.com/api/?name=NETFLIX&background=201d1e&color=e50914&size=512&bold=true', tag: 'الأكثر مبيعاً' },
  { id: 2, name: 'ChatGPT Plus', description: 'تفعيل فوري • شهر كامل', price: 120000, category: 'الذكاء الاصطناعي', art: 'AI', artClass: 'art-chat', image: 'https://ui-avatars.com/api/?name=AI&background=dfece6&color=1e9a68&size=512&bold=true', tag: 'جديد' },
  { id: 15, name: 'Gemini AI', description: 'تفعيل فوري • شهر كامل', price: 120000, category: 'الذكاء الاصطناعي', art: 'G', artClass: 'art-chat', image: 'image/gemni.jpg', tag: 'جديد' },
  { id: 3, name: 'شحن PUBG Mobile', description: 'شحن UC • ID الحساب', price: 45000, category: 'شحن الألعاب', art: 'UC', artClass: 'art-pubg', image: 'image/PUB.jpg', tag: '' },
  { id: 4, name: 'شحن Free Fire', description: 'شحن Diamonds • ID الحساب', price: 40000, category: 'شحن الألعاب', art: 'FF', artClass: 'art-freefire', image: 'image/FREEFR.jpg', tag: '' },
  { id: 5, name: 'شحن جواكر', description: 'شحن نقاط • ID الحساب', price: 30000, category: 'شحن الألعاب', art: 'J', artClass: 'art-jawaker', image: 'https://ui-avatars.com/api/?name=J&background=681c35&color=ffd56b&size=512&bold=true', tag: '' },
  { id: 6, name: 'شحن سوكو', description: 'عملات سوكو • ID الحساب', price: 10000, category: 'تطبيقات الدردشة', art: 'S', artClass: 'art-soko', image: 'image/sugo.jpg', tag: '' },
  { id: 7, name: 'شحن زينة', description: 'عملات زينة • ID الحساب', price: 10000, category: 'تطبيقات الدردشة', art: 'Z', artClass: 'art-zeina', image: 'image/ZENA.jpg', tag: '' },
  { id: 8, name: 'شحن Meyo', description: 'عملات Meyo • ID الحساب', price: 25000, category: 'تطبيقات الدردشة', art: 'M', artClass: 'art-meyo', image: 'image/meyo.jpg', tag: '' },
  { id: 9, name: 'شحن سو ماتش', description: 'عملات سو ماتش • ID الحساب', price: 25000, category: 'تطبيقات الدردشة', art: 'SM', artClass: 'art-somatch', image: 'somatch.jpg', tag: '' },
  { id: 10, name: 'شحن يا حلا', description: 'عملات يا حلا • ID الحساب', price: 25000, category: 'تطبيقات الدردشة', art: 'YH', artClass: 'art-yahala', image: 'image/yahhlan.jpg', tag: '' },
  { id: 11, name: 'شحن تكا', description: 'عملات تكا • ID الحساب', price: 25000, category: 'تطبيقات الدردشة', art: 'T', artClass: 'art-taka', image: 'image/TKA.jpg', tag: '' },
  { id: 12, name: 'تطبيقات دردشة أخرى', description: 'شحن عملات • أرسل اسم التطبيق', price: 25000, category: 'تطبيقات الدردشة', art: '…', artClass: 'art-chatmore', image: 'https://ui-avatars.com/api/?name=MORE&background=6c51c9&color=ffffff&size=512&bold=true', tag: 'اطلبها' },
  { id: 13, name: 'شحن زفّة', description: 'عملات زفّة • ID الحساب', price: 25000, category: 'تطبيقات الدردشة', art: 'Z', artClass: 'art-zafaa', image: 'image/zafaa.jpg', tag: '' },
  { id: 14, name: 'باقة متابعين انستغرام', description: 'متابعون حقيقيون • 1,000', price: 35000, category: 'السوشيال ميديا', art: '◎', artClass: 'art-follow', image: 'https://ui-avatars.com/api/?name=SOCIAL&background=dfc8da&color=cb287f&size=512&bold=true', tag: '' }
];
let cart = [];
const formatPrice = value => new Intl.NumberFormat('ar-SY').format(value) + ' ل.س';
const formatUsd = value => '$' + (value / SYRIAN_POUND_PER_USD).toFixed(2);
const formatDualPrice = value => `${formatPrice(value)} • ${formatUsd(value)}`;
const priceWithMarkup = value => value * 1.02;
const getProductPrice = product => {
  if (product.optionPrice !== undefined) return product.optionPrice * MEYO_MARKUP;
  if (product.id === ZEINA_PRODUCT_ID) {
    const units = Math.min(Math.max(product.price, ZEINA_MIN_UNITS), ZEINA_MAX_UNITS);
    const convertedPrice = (units / SUGO_UNITS_PER_RATE) * ZEINA_SYRIAN_POUNDS_PER_RATE;
    return Math.max(MIN_PRODUCT_PRICE, convertedPrice * ZEINA_MARKUP);
  }
  if (product.id !== SUGO_PRODUCT_ID) return Math.max(MIN_PRODUCT_PRICE, priceWithMarkup(product.price));
  const units = Math.min(Math.max(product.price, SUGO_MIN_UNITS), SUGO_MAX_UNITS);
  const convertedPrice = (units / SUGO_UNITS_PER_RATE) * SUGO_SYRIAN_POUNDS_PER_RATE;
  return Math.max(MIN_PRODUCT_PRICE, convertedPrice * SUGO_MARKUP);
};
const getCartItemPrice = item => getProductPrice(item);
const productGrid = document.getElementById('productGrid');
const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const drawerCount = document.getElementById('drawerCount');
const whatsappNumber = '963983032131';
const localWhatsappNumber = '0997613767';
const shamCashAccount = '3aaoba87763c47839effc2b8936dc8e8';
const mtnCashAccount = '+963953942665';
const API_ORIGIN = location.port === '3000' ? '' : 'http://localhost:3000';
const accountModal = document.getElementById('accountModal');
const accountForm = document.getElementById('accountForm');
const accountButton = document.getElementById('accountButton');
const accountError = document.getElementById('accountError');
const accountSummary = document.getElementById('accountSummary');
let accountMode = 'login';
let currentUser = null;
const aiCategory = document.querySelector('.cat-blue');
aiCategory?.setAttribute('data-category', 'الذكاء الاصطناعي');
aiCategory?.insertAdjacentHTML('afterbegin', '<span class="category-images"><img src="image/gemni.jpg" alt="Gemini"><img src="image/ai1.jpg" alt="خدمة ذكاء اصطناعي"><img src="image/ai2.jpg" alt="خدمة ذكاء اصطناعي"></span>');
document.querySelector('.cat-yellow')?.insertAdjacentHTML('afterbegin', '<span class="category-images game-category-images"><img src="image/PUB.jpg" alt="PUBG"><img src="image/FREEFR.jpg" alt="Free Fire"></span>');
document.querySelector('.filter-row')?.insertAdjacentHTML('beforeend', '<button class="filter" data-filter="الذكاء الاصطناعي">AI</button>');
document.querySelector('.footer-contact a').firstChild.textContent = '+963 983 032 131 ';
document.querySelector('.cash-number strong').textContent = '+963 983 032 131';

function renderProducts(filter = 'الكل') {
  const visible = filter === 'الكل' ? products : products.filter(product => product.category === filter);
  productGrid.innerHTML = visible.map(product => {
    const isMeyo = product.id === MEYO_PRODUCT_ID;
    const priceMarkup = isMeyo ? '<strong>اختر الباقة</strong>' : `<strong>${formatPrice(getProductPrice(product))}</strong><small>${formatUsd(getProductPrice(product))} / وحدة</small>`;
    const actions = isMeyo
      ? MEYO_OPTIONS.map(option => `<button class="add-button" data-add="${product.id}" data-option-id="${option.id}" aria-label="شحن Meyo ${option.label}">${option.label}</button>`).join('')
      : `<button class="add-button" data-add="${product.id}" aria-label="شحن ${product.name}">شحن</button>`;
    return `<article class="product-card"><div class="product-art ${product.artClass}">${product.tag ? `<span class="tag">${product.tag}</span>` : ''}<img src="${product.image}" alt="${product.name}" loading="lazy"><span class="art-fallback">${product.art}</span></div><h3>${product.name}</h3><p>${product.description}</p><div class="price">${priceMarkup}</div><div class="product-bottom">${actions}</div></article>`;
  }).join('');
}
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + getCartItemPrice(item) * item.quantity, 0);
  cartCount.textContent = count;
  drawerCount.textContent = count;
  cartTotal.textContent = formatDualPrice(total);
  cartItems.innerHTML = count ? cart.map(item => `<div class="cart-item"><div class="cart-item-art"><img src="${item.image}" alt=""></div><div class="cart-item-info"><b>${item.name}</b><small>${formatDualPrice(getCartItemPrice(item) * item.quantity)}</small><div class="cart-quantity"><button data-cart-step="-1" data-cart-id="${item.id}">−</button><span>${item.quantity}</span><button data-cart-step="1" data-cart-id="${item.id}">+</button></div></div><button class="remove-item" data-remove="${item.id}" aria-label="حذف ${item.name}">×</button></div>`).join('') : '<div class="empty-cart"><span>＋</span><p>السلة فارغة حالياً</p><small>أضف خدمة لتبدأ طلبك</small></div>';
}
function openCart() { cartDrawer.classList.add('open'); overlay.classList.add('visible'); cartDrawer.setAttribute('aria-hidden', 'false'); }
function closePanels() { cartDrawer.classList.remove('open'); document.getElementById('checkoutModal').classList.remove('open'); overlay.classList.remove('visible'); }
function openCheckout() {
  if (!cart.length) return;
  const total = cart.reduce((sum, item) => sum + getCartItemPrice(item) * item.quantity, 0);
  document.getElementById('modalTotal').textContent = formatDualPrice(total);
  document.getElementById('accountId').value = '';
  document.getElementById('transactionInfo').value = '';
  document.querySelector('input[name="paymentMethod"][value="سيرياتل كاش"]').checked = true;
  updatePaymentInfo();
  cartDrawer.classList.remove('open'); document.getElementById('checkoutModal').classList.add('open');
}
function updatePaymentInfo() {
  const method = document.querySelector('input[name="paymentMethod"]:checked').value;
  const paymentInfo = document.getElementById('paymentInfo');
  if (method === 'سيرياتل كاش') paymentInfo.innerHTML = '<span>رقم سيرياتل كاش</span><strong>+963 983 032 131</strong><button id="copyNumber" title="نسخ الرقم">⧉</button>';
  else if (method === 'شام كاش') paymentInfo.innerHTML = `<span>حساب شام كاش</span><strong>${shamCashAccount}</strong><button id="copyShamAccount" title="نسخ الحساب">⧉</button><img class="sham-qr" src="image/shamqr.png" alt="QR حساب شام كاش">`;
  else if (method === 'MTN كاش') paymentInfo.innerHTML = `<span>رقم MTN كاش</span><strong>${mtnCashAccount}</strong><button id="copyMtnAccount" title="نسخ الرقم">⧉</button>`;
  else paymentInfo.innerHTML = `<span>تفاصيل ${method}</span><strong>تصل عبر واتساب</strong>`;
  document.getElementById('copyNumber')?.addEventListener('click', copyPaymentNumber);
  document.getElementById('copyShamAccount')?.addEventListener('click', async () => { await navigator.clipboard.writeText(shamCashAccount); const toast = document.getElementById('toast'); toast.textContent = 'تم نسخ حساب شام كاش'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); });
  document.getElementById('copyMtnAccount')?.addEventListener('click', async () => { await navigator.clipboard.writeText(mtnCashAccount.replace('+963', '0')); const toast = document.getElementById('toast'); toast.textContent = 'تم نسخ رقم MTN كاش'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); });
}
async function copyPaymentNumber() { await navigator.clipboard.writeText(localWhatsappNumber); const toast = document.getElementById('toast'); toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); }
productGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const product = products.find(item => item.id === Number(button.dataset.add));
  const option = product.id === MEYO_PRODUCT_ID ? MEYO_OPTIONS.find(item => item.id === Number(button.dataset.optionId)) : null;
  const cartProduct = option ? { ...product, id: option.id, name: `${product.name} - ${option.label}`, optionPrice: option.price } : product;
  const quantity = 1;
  const existing = cart.find(item => item.id === cartProduct.id);
  if (existing) existing.quantity += quantity;
  else cart.push({ ...cartProduct, quantity });
  renderCart(); openCart();
});
cartItems.addEventListener('click', event => {
  const stepButton = event.target.closest('[data-cart-step]');
  if (stepButton) {
    const item = cart.find(entry => entry.id === Number(stepButton.dataset.cartId));
    item.quantity = Math.max(1, item.quantity + Number(stepButton.dataset.cartStep));
    renderCart();
    return;
  }
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  cart = cart.filter(item => item.id !== Number(button.dataset.remove)); renderCart();
});
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { document.querySelector('.filter.active').classList.remove('active'); button.classList.add('active'); renderProducts(button.dataset.filter); }));
document.querySelectorAll('.category-card').forEach(button => button.addEventListener('click', () => { const filter = document.querySelector(`[data-filter="${button.dataset.category}"]`); document.getElementById('products').scrollIntoView({ behavior: 'smooth' }); if (filter) filter.click(); else { document.querySelector('.filter.active').classList.remove('active'); document.querySelector('[data-filter="الكل"]').classList.add('active'); renderProducts(); } }));
document.getElementById('cartButton').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closePanels);
document.getElementById('overlay').addEventListener('click', closePanels);
document.getElementById('checkoutButton').addEventListener('click', openCheckout);
document.getElementById('closeModal').addEventListener('click', closePanels);
document.getElementById('cancelCheckout').addEventListener('click', closePanels);
document.querySelectorAll('input[name="paymentMethod"]').forEach(input => input.addEventListener('change', updatePaymentInfo));
document.getElementById('whatsappButton').addEventListener('click', event => {
  const accountId = document.getElementById('accountId').value.trim();
  const transactionInfo = document.getElementById('transactionInfo').value.trim();
  if (!accountId) { event.preventDefault(); alert('يرجى إدخال رقم ID قبل متابعة الشحن.'); document.getElementById('accountId').focus(); return; }
  if (!transactionInfo) { event.preventDefault(); alert('يرجى إدخال رقم العملية أو محتوى التحويل.'); document.getElementById('transactionInfo').focus(); return; }
  const total = cart.reduce((sum, item) => sum + getCartItemPrice(item) * item.quantity, 0);
  const order = cart.map(item => `- ${item.name} × ${item.quantity}: ${formatPrice(getCartItemPrice(item) * item.quantity)}`).join('\n');
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  const paymentAccount = paymentMethod === 'MTN كاش' ? mtnCashAccount : paymentMethod === 'سيرياتل كاش' ? '+963 983 032 131' : shamCashAccount;
  const message = `مرحباً ZIAD.STORE، أود تأكيد طلبي:\nID الحساب للشحن: ${accountId}\nوسيلة الدفع: ${paymentMethod}\nحساب/رقم الدفع: ${paymentAccount}\nرقم العملية أو محتوى التحويل: ${transactionInfo}\n${order}\nالإجمالي: ${formatDualPrice(total)}\nسأرسل إثبات التحويل الآن.`;
  event.preventDefault();
  window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
});
document.getElementById('copyNumber').addEventListener('click', copyPaymentNumber);
function setAccountMode(mode) {
  accountMode = mode;
  document.getElementById('accountTitle').textContent = mode === 'register' ? 'إنشاء حساب' : 'تسجيل الدخول';
  document.querySelector('.account-name-field').hidden = mode !== 'register';
  document.querySelector('.account-submit').textContent = mode === 'register' ? 'إنشاء الحساب' : 'دخول';
  document.getElementById('accountSwitch').textContent = mode === 'register' ? 'لدي حساب، تسجيل الدخول' : 'إنشاء حساب جديد';
  document.getElementById('accountError').textContent = '';
}
function openAccount() { accountModal.classList.add('open'); accountModal.setAttribute('aria-hidden', 'false'); accountSummary.hidden = Boolean(!currentUser); accountForm.hidden = Boolean(currentUser); document.getElementById('guestButton').hidden = Boolean(currentUser); document.getElementById('accountSwitch').hidden = Boolean(currentUser); }
function closeAccount() { accountModal.classList.remove('open'); accountModal.setAttribute('aria-hidden', 'true'); }
function renderAccount(data) {
  currentUser = data.user;
  accountButton.textContent = currentUser.name;
  accountForm.hidden = true; document.getElementById('guestButton').hidden = true; document.getElementById('accountSwitch').hidden = true; accountSummary.hidden = false;
  document.getElementById('accountWelcome').textContent = `مرحباً ${currentUser.name}`;
  document.getElementById('accountBalance').textContent = formatPrice(currentUser.balance);
  document.getElementById('accountTransactions').innerHTML = (data.transactions || []).slice(0, 8).map(item => `<div class="account-transaction"><span>${item.description}</span><b>${formatPrice(item.amount)}<small>${item.status === 'completed' ? 'مكتملة' : 'قيد التحقق'}</small></b></div>`).join('') || '<small>لا توجد عمليات بعد.</small>';
}
async function accountRequest(endpoint, body) { let response; try { response = await fetch(`${API_ORIGIN}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) }); } catch { throw new Error('تعذر الاتصال بالخادم. شغّل الأمر npm start ثم افتح http://localhost:3000'); } const text = await response.text(); let data; try { data = JSON.parse(text); } catch { throw new Error(text.trim() === 'Forbidden.' ? 'الصفحة مفتوحة من خادم لا يدعم API. افتح http://localhost:3000 بعد تشغيل npm start.' : text.trim() || 'تعذر قراءة رد الخادم.'); } if (!response.ok) throw new Error(data.error || 'تعذر الاتصال بالخادم.'); return data; }
accountButton.addEventListener('click', async () => { if (currentUser) { try { renderAccount(await (await fetch(`${API_ORIGIN}/api/me`, { credentials: 'include' })).json()); } catch {} } setAccountMode('login'); openAccount(); });
document.getElementById('accountClose').addEventListener('click', closeAccount);
document.getElementById('guestButton').addEventListener('click', closeAccount);
document.getElementById('accountSwitch').addEventListener('click', () => setAccountMode(accountMode === 'login' ? 'register' : 'login'));
accountForm.addEventListener('submit', async event => { event.preventDefault(); accountError.textContent = ''; const body = { phone: document.getElementById('accountPhone').value.trim(), password: document.getElementById('accountPassword').value }; if (accountMode === 'register') body.name = document.getElementById('accountName').value.trim(); try { const data = await accountRequest(accountMode === 'register' ? '/api/register' : '/api/login', body); renderAccount(data); } catch (error) { accountError.textContent = error.message; } });
document.getElementById('logoutButton').addEventListener('click', async () => { await fetch(`${API_ORIGIN}/api/logout`, { method: 'POST', credentials: 'include' }); currentUser = null; accountButton.textContent = 'تسجيل الدخول'; setAccountMode('login'); accountSummary.hidden = true; accountForm.hidden = false; document.getElementById('guestButton').hidden = false; document.getElementById('accountSwitch').hidden = false; });
document.getElementById('topupButton').addEventListener('click', () => { document.getElementById('topupForm').hidden = !document.getElementById('topupForm').hidden; });
document.getElementById('topupSubmit').addEventListener('click', async () => { try { const data = await accountRequest('/api/topup', { amount: document.getElementById('topupAmount').value, method: document.getElementById('topupMethod').value, reference: document.getElementById('topupReference').value.trim() }); accountError.textContent = data.message; const profile = await (await fetch(`${API_ORIGIN}/api/me`, { credentials: 'include' })).json(); renderAccount(profile); } catch (error) { accountError.textContent = error.message; } });
renderProducts(); renderCart();
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. البحث عن المستخدم في قاعدة البيانات (سواء كانت سحابية أو من ملف database.js)
        const user = await db.findUserByEmail(email); 
        
        if (!user) {
            return res.status(400).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        // 2. التحقق من كلمة المرور (تأكد من مطابقتها لطريقة التشفير لديك)
        if (user.password !== password) { 
            return res.status(400).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        // 3. توليد رمز الأمان (JWT Token) وتخزين الـ ID والصلاحية (Role) بداخله
        // نقرأ المفتاح السري منprocess.env المحمي لرفع الآمن على GitHub
        const token = jwt.sign(
            { id: user.id, role: user.role || 'user' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } // الرمز الصلاحية تنتهي بعد يوم واحد
        );

        // 4. إرسال التوكن والصلاحية ونوع المستخدم إلى المتصفح
        res.json({
            message: "تم تسجيل الدخول بنجاح",
            token: token,
            role: user.role || 'user' // ستكون إما 'user' أو 'admin'
        });

    } catch (error) {
        res.status(500).json({ error: "حدث خطأ في السيرفر أثناء تسجيل الدخول" });
    }
});
