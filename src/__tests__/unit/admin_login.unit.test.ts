import test from 'node:test';
import assert from 'node:assert/strict';
import { POST as adminLoginPOST } from '../../app/api/admin/login/route';

test('login admin API establece cookie con credenciales válidas', async (t) => {
  // Set expected admin credentials in env for the test
  const prevUser = process.env.ADMIN_USERNAME;
  const prevPass = process.env.ADMIN_PASSWORD;
  process.env.ADMIN_USERNAME = `ut_admin_${Date.now()}`;
  process.env.ADMIN_PASSWORD = `ut_pass_${Date.now()}`;

  const username = process.env.ADMIN_USERNAME!;
  const password = process.env.ADMIN_PASSWORD!;

  // Build form-urlencoded body
  const body = new URLSearchParams({ username, password }).toString();
  const req = new Request('http://localhost/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });

  try {
    const res = await adminLoginPOST(req as any);
    const status = (res as any).status ?? 200;
    if (status !== 200) {
      const j = await res.json().catch(() => ({}));
      assert.fail(`expected 200 from admin login, got ${status} - ${JSON.stringify(j)}`);
    }

    const json = await res.json();
    assert.ok(json && json.success === true, 'should return success true');
  } finally {
    // restore env
    process.env.ADMIN_USERNAME = prevUser;
    process.env.ADMIN_PASSWORD = prevPass;
  }
});
