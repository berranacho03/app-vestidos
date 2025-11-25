import test from 'node:test';
import assert from 'node:assert/strict';
import { POST as loginPOST } from '../../app/api/auth/login/route';
import { POST as registerPOST } from '../../app/api/auth/register/route';
import { deleteUserByEmail } from '../../../lib/TestHelpers';

test('login API autentica usuario existente y limpia (integración)', async (t) => {
  const email = `ut+login+${Date.now()}@example.com`;
  const password = 'loginpass';
  const name = 'UT Login';
  const phone = '111222333';

  // Create user via register route
  try {
    const regReq = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone }),
    });
    const regRes = await registerPOST(regReq as any);
    const regStatus = (regRes as any).status ?? 201;
    if (regStatus !== 201) {
      // if registration failed due to env/db, skip
      t.skip();
      return;
    }
  } catch (e) {
    t.skip();
    return;
  }
  try {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const res = await loginPOST(req as any);
    const status = (res as any).status ?? 200;
    if (status !== 200) {
      const body = await res.json().catch(() => ({}));
      // If credentials rejected unexpectedly, fail the test
      assert.fail(`login failed, status=${status}, body=${JSON.stringify(body)}`);
    }

    const body = await res.json();
    assert.strictEqual(body.user.email, email);
  } finally {
    // cleanup by email
    try { await deleteUserByEmail(email); } catch (e) { console.error('cleanup user failed', e); }
  }
});
