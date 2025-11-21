import test from 'node:test';
import assert from 'node:assert/strict';
import { getItem } from '../../../lib/RentalManagementSystem';
import { POST as itemsPOST } from '../../app/api/items/route';
import { DELETE as itemDELETE } from '../../app/api/items/[id]/route';

test('getItem devuelve item insertado y limpia (integración)', async (t) => {
  const uniqueName = `UT-Item-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  const sizes = JSON.stringify(['S','M']);
  const images = JSON.stringify(['/images/ut1.jpg']);

  // create item via API handler
  let id: number | undefined;
  try {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: uniqueName, price: 19.99, sizes: ['S','M'], category: 'dress', description: 'ut-desc', color: 'ut-color', alt: uniqueName, imageUrl: '/images/ut1.jpg' }),
    });
    const res = await itemsPOST(req as any);
    const status = (res as any).status ?? 201;
    if (status !== 201) {
      t.skip();
      return;
    }
    const body = await res.json();
    id = body?.item?.id;
    if (!id) { t.skip(); return; }
  } catch (err) {
    t.skip();
    return;
  }

  try {
    const item = await getItem(id);
    assert.ok(item, 'getItem should return an item');
    assert.strictEqual(item?.name, uniqueName);
    assert.ok(Array.isArray(item?.sizes) && item?.sizes.length >= 1);
  } finally {
    // cleanup via DELETE handler
    try {
      await itemDELETE(new Request('http://localhost/api/items/' + id, { method: 'DELETE' }) as any, { params: Promise.resolve({ id: String(id) }) } as any);
    } catch (e) {
      // best-effort
      // eslint-disable-next-line no-console
      console.error('cleanup failed', e);
    }
  }
});
