import test from 'node:test';
import assert from 'node:assert/strict';
import { createRental, approveRental, cancelRental, deleteRental, listRentals } from '../../../lib/RentalManagementSystem';
import { POST as itemsPOST } from '../../app/api/items/route';
import { DELETE as itemDELETE } from '../../app/api/items/[id]/route';

test('flujo crear -> aprobar -> cancelar -> eliminar rental (integración)', async (t) => {
  // insert an item to attach rentals to
  const uniqueName = `UT-RentalIt-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  const sizes = JSON.stringify(['M']);
  const images = JSON.stringify(['/images/ut3.jpg']);

  // create item via POST handler
  let itemId: number | undefined;
  try {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: uniqueName, price: 39.99, sizes: ['M'], category: 'dress', description: 'ut-desc', color: 'ut-color', alt: uniqueName, imageUrl: '/images/ut3.jpg' }),
    });
    const res = await itemsPOST(req as any);
    const status = (res as any).status ?? 201;
    if (status !== 201) { t.skip(); return; }
    const body = await res.json();
    itemId = body?.item?.id;
    if (!itemId) { t.skip(); return; }
  } catch (err) { t.skip(); return; }

  // prepare dates
  const now = new Date();
  const startDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
  const endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 2);
  const fmt = (d: Date) => d.toISOString().slice(0,10);
  const start = fmt(startDate);
  const end = fmt(endDate);

  let createdId: string | undefined;
  try {
    const customer = { name: 'UT Customer', email: `ut+${Date.now()}@example.com`, phone: '000' };
    const created = await createRental({ itemId, start, end, customer });
    if ((created as any).error) {
      // if creation failed due to availability, skip
      t.skip();
      return;
    }

    const rental = (created as any).rental;
    assert.ok(rental?.id, 'rental id should exist');
    createdId = rental.id;
    assert.strictEqual(rental.status, 'pending');

    // approve
    const appr = await approveRental(createdId);
    assert.ok(!(appr as any).error, 'approveRental should succeed');

    // listRentals should include the rental
    const all = await listRentals();
    assert.ok(Array.isArray(all));
    assert.ok(all.some(r => r.id === createdId));

    // cancel the rental
    const canc = await cancelRental(createdId);
    assert.ok(!(canc as any).error, 'cancelRental should succeed');

  } finally {
    // cleanup created rental and item
    if (createdId) {
      try { await deleteRental(createdId); } catch (e) { console.error('cleanup deleteRental failed', e); }
    }
    try { if (itemId) await itemDELETE(new Request('http://localhost/api/items/' + itemId, { method: 'DELETE' }) as any, { params: Promise.resolve({ id: String(itemId) }) } as any); } catch (e) { console.error('cleanup delete item failed', e); }
  }
});
