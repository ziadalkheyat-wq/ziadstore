// ========================================================
// --- دوال التحكم المتقدمة المضافة للمدير (سيرفر المحرك الحقيقي) ---
// ========================================================

async function handleAdminLogin(request, response) {
  const body = await readJson(request);
  if (body.password === ADMIN_PASSWORD) {
    const adminSessionId = crypto.randomBytes(32).toString('hex');
    sessions.set(adminSessionId, 'admin_authenticated');
    response.setHeader('Set-Cookie', `admin_session=${adminSessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`);
    return json(response, 200, { success: true, message: 'تم تسجيل دخول المدير بنجاح.' });
  }
  return json(response, 401, { success: false, error: 'كلمة مرور المدير غير صحيحة!' });
}

function handleAdminGetUsers(request, response) {
  if (!requireAdmin(request, response)) return;
  const users = database.listUsers();
  return json(response, 200, { success: true, users });
}

// مسار لجلب كافة الحركات المالية لجميع المستخدمين (الوارد والصادر)
function handleAdminGetTransactions(request, response) {
  if (!requireAdmin(request, response)) return;
  const transactions = database.listTransactions();
  return json(response, 200, { success: true, transactions });
}

// مسار لجلب حركات مالية خاصة بمسخدم محدد عند الضغط على اسمه
function handleAdminGetUserTransactions(request, response, url) {
  if (!requireAdmin(request, response)) return;
  const userId = url.pathname.split('/').pop();
  const transactions = database.getTransactions(userId);
  return json(response, 200, { success: true, transactions });
}

// مسار للمدير للموافقة على شحن رصيد معلق أو رفضه
async function handleAdminUpdateTopup(request, response) {
  if (!requireAdmin(request, response)) return;
  const body = await readJson(request);
  const { transactionId, status } = body; // الحالات المقبولة: 'completed' أو 'rejected'
  
  const result = database.updateTopup(transactionId, status);
  if (!result) return json(response, 400, { success: false, error: 'تعذر تحديث حالة الطلب. تحقق من البيانات.' });
  
  return json(response, 200, { success: true, message: 'تم تحديث حالة العملية وتعديل رصيد العميل بنجاح.', result });
}

// مسار للمدير لتعديل رصيد مستخدم يدوياً (شحن أو خصم مباشرة)
async function handleAdminAdjustBalance(request, response) {
  if (!requireAdmin(request, response)) return;
  const body = await readJson(request);
  const { userId, amount, description } = body;
  
  const result = database.adjustBalance(userId, Number(amount), description);
  if (!result) return json(response, 400, { success: false, error: 'تعذر تعديل الرصيد. قد يكون الرصيد الناتج أقل من الصفر.' });
  
  return json(response, 200, { success: true, message: 'تم تعديل رصيد العميل بنجاح.', user: result.user });
}

async function handleAdminDeleteUser(request, response, url) {
  if (!requireAdmin(request, response)) return;
  const id = url.pathname.split('/').pop();
  
  const dbData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
  const initialLength = dbData.users.length;
  dbData.users = dbData.users.filter(u => u.id !== id);
  dbData.transactions = dbData.transactions.filter(t => t.userId !== id);
  
  if (dbData.users.length === initialLength) {
      return json(response, 404, { success: false, error: 'المستخدم غير موجود.' });
  }
  
  fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(dbData, null, 2), 'utf8');
  database.createUser({name: 'dummy', phone: '000', password: 'd'});
  const cleanData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
  cleanData.users = cleanData.users.filter(u => u.phone !== '000');
  fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(cleanData, null, 2), 'utf8');
  
  return json(response, 200, { success: true, message: 'تم حذف حساب المستخدم بنجاح.' });
}

function requireConfig() {
  const required = ['APISYRIA_API_KEY', 'SYRIATEL_SOURCE_GSM', 'SYRIATEL_PIN'];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length) throw new Error(`Missing server configuration: ${missing.join(', ')}`);
}

async function apiRequest(resource, action, body) {
  const response = await fetch(`${API_BASE_URL}/api/v1?resource=${resource}&action=${action}`, {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.APISYRIA_API_KEY,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(body)
  });
  const data = await readApiResponse(response);
  return { status: response.status, data };
}

async function verifySyriatelPayment(transactionId, expectedAmount) {
  const query = new URLSearchParams({
    resource: 'syriatel',
    action: 'find_tx',
    tx: transactionId,
    gsm: process.env.SYRIATEL_SOURCE_GSM,
    api_key: process.env.APISYRIA_API_KEY
  });
  const response = await fetch(`${API_BASE_URL}/api/v1?${query}`);
  const data = await readApiResponse(response);
  const transaction = data?.data?.transaction;
  const amount = Number(transaction?.amount);
  return {
    verified: data?.success === true && data?.data?.found === true && Number.isFinite(amount) && amount >= Number(expectedAmount),
    data
  };
}

async function handleApiStatus(response) {
  if (!process.env.APISYRIA_API_KEY) return json(response, 500, { success: false, error: 'مفتاح API غير مضبوط على الخادم.' });
  const apiResponse = await fetch(`${API_BASE_URL}/api/v1?resource=status`, {
    headers: { 'X-Api-Key': process.env.APISYRIA_API_KEY, Accept: 'application/json' }
  });
  const data = await readApiResponse(apiResponse);
  return json(response, apiResponse.status, data);
}

async function handleRecharge(request, response) {
  requireConfig();
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  const transactionId = String(body.transactionId || '').trim();
  const targetGsm = String(body.targetGsm || '').trim();
  const category = String(body.category || '').trim();
  const expectedAmount = Number(body.expectedAmount);
  if (!/^\d{3,30}$/.test(transactionId) || !/^09\d{8}$/.test(targetGsm) || !category || !Number.isFinite(expectedAmount) || expectedAmount <= 0) {
    return json(response, 400, { success: false, error: 'بيانات الشحن غير صحيحة.' });
  }

  const payment = await verifySyriatelPayment(transactionId, expectedAmount);
  if (!payment.verified) return json(response, 402, { success: false, error: 'لم يتم العثور على دفعة مطابقة أو أن المبلغ غير كافٍ.', payment: payment.data });

  const recharge = await apiRequest('syriatel', 'mobile_recharge', {
    gsm: process.env.SYRIATEL_SOURCE_GSM,
    target_gsm: targetGsm,
    category,
    pin_code: process.env.SYRIATEL_PIN
  });
  return json(response, recharge.status, recharge.data);
}

function serveStatic(request, response, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(publicRoot, requested));
  if (!filePath.startsWith(publicRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return json(response, 404, { success: false, error: 'Not found' });
  const extension = path.extname(filePath).toLowerCase();
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png' };
  response.writeHead(200, { 'Content-Type': types[extension] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  try {
    if (request.method === 'OPTIONS') {
      response.writeHead(204, { 'Access-Control-Allow-Origin': `http://${process.env.FRONTEND_HOST || 'localhost:5500'}`, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE' });
      return response.end();
    }
    if (request.method === 'POST' && url.pathname === '/api/register') return await handleRegister(request, response);
    if (request.method === 'POST' && url.pathname === '/api/login') return await handleLogin(request, response);
    if (request.method === 'POST' && url.pathname === '/api/logout') return handleLogout(request, response);
    if (request.method === 'GET' && url.pathname === '/api/me') return handleMe(request, response);
    if (request.method === 'POST' && url.pathname === '/api/topup') return await handleTopup(request, response);
    if (request.method === 'POST' && url.pathname === '/api/mobile-recharge') return await handleRecharge(request, response);
    if (request.method === 'GET' && url.pathname === '/api/apisyria-status') return await handleApiStatus(response);
    
    // --- ربط مسارات التحكم الموسعة للمدير داخل محرك السيرفر ---
    if (request.method === 'POST' && url.pathname === '/api/admin/login') return await handleAdminLogin(request, response);
    if (request.method === 'GET' && url.pathname === '/api/admin/users') return handleAdminGetUsers(request, response);
    if (request.method === 'GET' && url.pathname === '/api/admin/transactions') return handleAdminGetTransactions(request, response);
    if (request.method === 'GET' && url.pathname.startsWith('/api/admin/user-transactions/')) return handleAdminGetUserTransactions(request, response, url);
    if (request.method === 'POST' && url.pathname === '/api/admin/update-topup') return await handleAdminUpdateTopup(request, response);
    if (request.method === 'POST' && url.pathname === '/api/admin/adjust-balance') return await handleAdminAdjustBalance(request, response);
    if (request.method === 'DELETE' && url.pathname.startsWith('/api/admin/users/')) return await handleAdminDeleteUser(request, response, url);

    if (request.method === 'GET') return serveStatic(request, response, url.pathname);
