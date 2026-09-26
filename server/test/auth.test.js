const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smartflow_test_jwt_secret_key_12345';

test('SmartFlow Auth Suite - Password Hashing and Verification', async () => {
  const plainPassword = 'SuperSecurePassword2026!';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  assert.notStrictEqual(hashedPassword, plainPassword, 'Password must be hashed');
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  assert.strictEqual(isMatch, true, 'Matching password must resolve to true');

  const isWrongMatch = await bcrypt.compare('WrongPassword!', hashedPassword);
  assert.strictEqual(isWrongMatch, false, 'Non-matching password must resolve to false');
});

test('SmartFlow Auth Suite - Registration Input Validation', () => {
  const validateRegistration = (name, email, password) => {
    if (!name || !email || !password) return { valid: false, error: 'All fields are required' };
    if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
    if (!/^\S+@\S+\.\S+$/.test(email)) return { valid: false, error: 'Invalid email format' };
    return { valid: true };
  };

  assert.strictEqual(validateRegistration('', 'user@example.com', 'secret123').valid, false);
  assert.strictEqual(validateRegistration('User', '', 'secret123').valid, false);
  assert.strictEqual(validateRegistration('User', 'user@example.com', '12345').valid, false);
  assert.strictEqual(validateRegistration('User', 'not-an-email', 'secret123').valid, false);
  assert.strictEqual(validateRegistration('Alice Smith', 'alice@smartflow.io', 'securePass789').valid, true);
});

test('SmartFlow Auth Suite - JWT Token Issuance and Verification', () => {
  const userId = 'usr_998877665544';
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });

  assert.ok(typeof token === 'string' && token.length > 20, 'JWT token must be non-empty string');

  const decoded = jwt.verify(token, JWT_SECRET);
  assert.strictEqual(decoded.id, userId, 'Decoded user ID must match issued ID');
  assert.ok(decoded.exp > decoded.iat, 'Token expiration must be in the future');
});

test('SmartFlow Auth Suite - Tampered JWT Token Rejection', () => {
  const userId = 'usr_123';
  const token = jwt.sign({ id: userId }, JWT_SECRET);
  const tamperedToken = token.slice(0, -5) + 'xxxxx';

  assert.throws(
    () => { jwt.verify(tamperedToken, JWT_SECRET); },
    /invalid signature|jwt malformed/,
    'Tampered token must throw signature verification error'
  );
});
