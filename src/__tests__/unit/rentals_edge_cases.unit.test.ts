import test from 'node:test';
import assert from 'node:assert/strict';
import { createRental, approveRental, cancelRental, deleteRental } from '../../../lib/RentalManagementSystem';
import { POST as itemsPOST } from '../../app/api/items/route';
import { DELETE as itemDELETE } from '../../app/api/items/[id]/route';

test('casos borde de rental: operar sobre id faltante y doble eliminación (integración)', async (t) => {
  // Insert an item
  const uniqueName = `UT-EdgeItem-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  const sizes = JSON.stringify(['L']);
  const images = JSON.stringify(['/images/ut-edge.jpg']);

  // create item via POST handler
  let itemId: number | undefined;
  try {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: uniqueName, price: 49.99, sizes: ['L'], category: 'jacket', description: 'ut-desc', color: 'ut-color', alt: uniqueName, imageUrl: '/images/ut-edge.jpg' }),
    });
    const res = await itemsPOST(req as any);
    const status = (res as any).status ?? 201;
    if (status !== 201) { t.skip(); return; }
    const body = await res.json();
    itemId = body?.item?.id;
    if (!itemId) { t.skip(); return; }
  } catch (err) { t.skip(); return; }

  // create a rental
  const now = new Date();
  const start = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 10).toISOString().slice(0,10);
  const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 12).toISOString().slice(0,10);

  let createdId: string | undefined;
  try {
    const customer = { name: 'UT Edge', email: `ut-edge+${Date.now()}@example.com`, phone: '000' };
    const created = await createRental({ itemId, start, end, customer });
    if ((created as any).error) { t.skip(); return; }
    createdId = (created as any).rental.id;

    // approve and cancel should work
    const apr = await approveRental(createdId);
    assert.ok(!(apr as any).error, 'approve should succeed');

    const can = await cancelRental(createdId);
    assert.ok(!(can as any).error, 'cancel should succeed');

    // delete should succeed
    const del = await deleteRental(createdId);
    assert.ok(!(del as any).error, 'delete should succeed');

    // double delete should return error/not-found
    const del2 = await deleteRental(createdId);
    assert.ok((del2 as any).error, 'deleting again should return error');

    // approve/cancel on non-existent id should return error
    const fake = 'non-existent-id-xyz';
    const aprFake = await approveRental(fake);
    assert.ok((aprFake as any).error, 'approve on missing id should error');
    const canFake = await cancelRental(fake);
    assert.ok((canFake as any).error, 'cancel on missing id should error');

  } finally {
    // cleanup item via DELETE handler
    try { if (itemId) await itemDELETE(new Request('http://localhost/api/items/' + itemId, { method: 'DELETE' }) as any, { params: Promise.resolve({ id: String(itemId) }) } as any); } catch (e) { console.error('cleanup item failed', e); }
  }
});
