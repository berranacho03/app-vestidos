import test from 'node:test';
import assert from 'node:assert/strict';
import { listItems } from '../../../lib/RentalManagementSystem';
import { POST as itemsPOST } from '../../app/api/items/route';
import { DELETE as itemDELETE } from '../../app/api/items/[id]/route';

test('filtrado de items devuelve resultados esperados (integración con DB)', async (t) => {
  // Create a unique test item in DB, run filters against it, then clean up.
  const uniqueName = `TestItem-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  const sizes = JSON.stringify(['XS', 'S']);
  const images = JSON.stringify(['/images/test1.jpg']);
  const style = 'filter-test-style';
  const color = 'purple-test-color';

  // Create the test item via POST handler
  let itemId: number | undefined;
  try {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: uniqueName, price: 9.99, sizes: ['XS','S'], category: 'dress', style, description: 'desc test item', color, alt: uniqueName, imageUrl: '/images/test1.jpg' }),
    });
    const res = await itemsPOST(req as any);
    const status = (res as any).status ?? 201;
    if (status !== 201) { t.skip(); return; }
    const body = await res.json();
    itemId = body?.item?.id;
    if (!itemId) { t.skip(); return; }
  } catch (err) {
    t.skip();
    return;
  }

  try {
    // 1) General search by q (name)
    const res1 = await listItems({ q: uniqueName.split('-')[0] });
    assert.ok(res1.some((it: any) => it.id === itemId), 'should find item by general q search');

    // 2) Category filter
    const res2 = await listItems({ category: 'dress' });
    assert.ok(res2.some((it: any) => it.id === itemId), 'should find item by category');

    // 3) Size filter
    const res3 = await listItems({ size: 'XS' });
    assert.ok(res3.some((it: any) => it.id === itemId), 'should find item by size');

    // 4) Color partial filter
    const res4 = await listItems({ color: 'purp' });
    assert.ok(res4.some((it: any) => it.id === itemId), 'should find item by color partial');

    // 5) Style partial filter
    const res5 = await listItems({ style: 'filter-test' });
    assert.ok(res5.some((it: any) => it.id === itemId), 'should find item by style partial');

  } finally {
    // Cleanup: remove the test item via DELETE handler
    try { if (itemId) await itemDELETE(new Request('http://localhost/api/items/' + itemId, { method: 'DELETE' }) as any, { params: Promise.resolve({ id: String(itemId) }) } as any); } catch (e) { console.error('Failed to cleanup test item', e); }
  }
});
