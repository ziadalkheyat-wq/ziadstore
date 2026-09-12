const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const databasePath = path.join(__dirname, 'data.json');

function loadDatabase() {
  if (!fs.existsSync(databasePath)) return { users: [], transactions: [] };
  try {
    return JSON.parse(fs.readFileSync(databasePath, 'utf8'));
  } catch (error) {
    throw new Error('تعذر قراءة قاعدة البيانات المحلية.');
  }
}

let database = loadDatabase();

function saveDatabase() {
  const temporaryPath = `${databasePath}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(database, null, 2), 'utf8');
  fs.renameSync(temporaryPath, databasePath);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${passwordHash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, expectedHash] = String(storedHash).split(':');
  if (!salt || !expectedHash) return false;
  const actualHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actualHash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

function publicUser(user) {
  return { id: user.id, name: user.name, phone: user.phone, balance: user.balance, createdAt: user.createdAt };
}

function createUser({ name, phone, password }) {
  const normalizedPhone = String(phone).trim();
  if (database.users.some(user => user.phone === normalizedPhone)) return null;
  const user = { id: crypto.randomUUID(), name: String(name).trim(), phone: normalizedPhone, passwordHash: hashPassword(password), balance: 0, createdAt: new Date().toISOString() };
  database.users.push(user);
  saveDatabase();
  return publicUser(user);
}

function findUserByPhone(phone) {
  return database.users.find(user => user.phone === String(phone).trim());
}

function findUserById(id) {
  return database.users.find(user => user.id === id);
}

function authenticate(phone, password) {
  const user = findUserByPhone(phone);
  return user && verifyPassword(password, user.passwordHash) ? publicUser(user) : null;
}

function addTransaction({ userId, type, amount, method, description, status = 'pending' }) {
  const transaction = { id: crypto.randomUUID(), userId, type, amount: Number(amount), method, description, status, createdAt: new Date().toISOString() };
  database.transactions.unshift(transaction);
  saveDatabase();
  return transaction;
}

function getTransactions(userId) {
  return database.transactions.filter(transaction => transaction.userId === userId);
}

function listUsers() {
  return database.users.map(publicUser);
}

function listTransactions() {
  return database.transactions.map(transaction => ({ ...transaction, user: publicUser(findUserById(transaction.userId) || { id: transaction.userId, name: 'مستخدم محذوف', phone: '', balance: 0, createdAt: transaction.createdAt }) }));
}

function updateTopup(transactionId, status) {
  const transaction = database.transactions.find(item => item.id === transactionId && item.type === 'topup');
  const user = transaction && findUserById(transaction.userId);
  if (!transaction || !user || !['completed', 'rejected'].includes(status)) return null;
  if (transaction.status === 'pending' && status === 'completed') user.balance += transaction.amount;
  transaction.status = status;
  transaction.updatedAt = new Date().toISOString();
  saveDatabase();
  return { transaction, user: publicUser(user) };
}

function adjustBalance(userId, amount, description = 'تعديل رصيد من المدير') {
  const user = findUserById(userId);
  const numericAmount = Number(amount);
  if (!user || !Number.isFinite(numericAmount) || numericAmount === 0 || user.balance + numericAmount < 0) return null;
  user.balance += numericAmount;
  const transaction = addTransaction({ userId, type: 'admin_adjustment', amount: numericAmount, method: 'المدير', description, status: 'completed' });
  return { user: publicUser(user), transaction };
}

function payFromBalance(userId, amount, description) {
  const user = findUserById(userId);
  const numericAmount = Number(amount);
  if (!user || !Number.isFinite(numericAmount) || numericAmount <= 0 || user.balance < numericAmount) return null;
  user.balance -= numericAmount;
  const transaction = addTransaction({ userId, type: 'payment', amount: numericAmount, method: 'رصيد الحساب', description, status: 'completed' });
  saveDatabase();
  return { user: publicUser(user), transaction };
}

module.exports = { createUser, findUserByPhone, findUserById, authenticate, publicUser, addTransaction, getTransactions, payFromBalance, listUsers, listTransactions, updateTopup, adjustBalance };
