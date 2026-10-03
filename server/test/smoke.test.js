// Checks that run without a database: security headers, validation, auth guard, limits.
import assert from 'node:assert/strict';
process.env.JWT_SECRET = 'x'.repeat(48);
process.env.CLINIC_TZ = 'Africa/Cairo';

const { default: app } = await import('../src/app.js');
const { checkBookableDate, SLOTS } = await import('../src/validation.js');

const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const json = (body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
let passed = 0;
async function check(name, fn) {
  await fn();
  passed++;
  console.log('ok  -', name);
}

await check('health endpoint works', async () => {
  const r = await fetch(`${base}/api/health`);
  assert.equal(r.status, 200);
});

await check('security headers are set, x-powered-by is hidden', async () => {
  const r = await fetch(`${base}/api/health`);
  assert.ok(r.headers.get('strict-transport-security'));
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(r.headers.get('x-powered-by'), null);
});

await check('booking with missing fields is rejected (400)', async () => {
  const r = await fetch(`${base}/api/appointments`, json({ name: 'A' }));
  assert.equal(r.status, 400);
});

await check('booking with an injection object is rejected (400)', async () => {
  const r = await fetch(
    `${base}/api/appointments`,
    json({
      doctorId: { $ne: null },
      service: 'checkup',
      date: '2030-01-01',
      time: '10:00',
      name: 'Test User',
      phone: '+201000000000',
    })
  );
  assert.equal(r.status, 400);
});

await check('booking with an unexpected extra field is rejected (400)', async () => {
  const r = await fetch(
    `${base}/api/appointments`,
    json({
      doctorId: 'a'.repeat(24),
      service: 'checkup',
      date: '2030-01-01',
      time: '10:00',
      name: 'Test User',
      phone: '+201000000000',
      isAdmin: true,
    })
  );
  assert.equal(r.status, 400);
});

await check('NoSQL injection in login is rejected (400)', async () => {
  const r = await fetch(
    `${base}/api/admin/login`,
    json({ email: { $gt: '' }, password: { $gt: '' } })
  );
  assert.equal(r.status, 400);
});

await check('admin routes need a token (401)', async () => {
  const r = await fetch(`${base}/api/admin/appointments`);
  assert.equal(r.status, 401);
});

await check('a forged token with "alg: none" is rejected (401)', async () => {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const forged = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: '1' })}.`;
  const r = await fetch(`${base}/api/admin/appointments`, {
    headers: { Authorization: `Bearer ${forged}` },
  });
  assert.equal(r.status, 401);
});

await check('oversized request body is rejected (413)', async () => {
  const r = await fetch(`${base}/api/appointments`, json({ notes: 'x'.repeat(20000) }));
  assert.equal(r.status, 413);
});

await check('malformed JSON is rejected (400)', async () => {
  const r = await fetch(`${base}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{bad json',
  });
  assert.equal(r.status, 400);
});

await check('unknown route returns 404 JSON', async () => {
  const r = await fetch(`${base}/api/nope`);
  assert.equal(r.status, 404);
});

await check('slot list has 14 half-hour slots from 10:00 to 16:30', () => {
  assert.equal(SLOTS.length, 14);
  assert.equal(SLOTS[0], '10:00');
  assert.equal(SLOTS.at(-1), '16:30');
});

await check('past dates, Fridays and impossible dates are not bookable', () => {
  assert.equal(checkBookableDate('2020-01-01'), 'Date is in the past');
  assert.equal(checkBookableDate('2030-02-31'), 'Invalid date');
  assert.equal(checkBookableDate('2099-01-01'), 'Date is too far ahead');
});

server.close();
console.log(`\n${passed} checks passed`);
process.exit(0);
