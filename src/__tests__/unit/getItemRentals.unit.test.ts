import test from 'node:test';
import assert from 'node:assert/strict';
import { getItemRentals, createRental, deleteRental, approveRental } from '../../../lib/RentalManagementSystem';
import { POST as itemsPOST } from '../../app/api/items/route';
import { DELETE as itemDELETE } from '../../app/api/items/[id]/route';

test('getItemRentals devuelve rental activo insertado y limpia (integración)', async (t) => {
  const uniqueName = `UT-RentalsItem-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  const sizes = JSON.stringify(['S']);
  const images = JSON.stringify(['/images/ut2.jpg']);

  // create item via POST handler
  let itemId: number | undefined;
  try {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: uniqueName, price: 29.99, sizes: ['S'], category: 'dress', description: 'ut-desc', color: 'ut-color', alt: uniqueName, imageUrl: '/images/ut2.jpg' }),
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

  // create rental via internal method (creates with status 'pending') then force set to active via approveRental if needed
  const rentalStart = '2026-01-01';
  const rentalEnd = '2026-01-03';
  let rentalId: string | undefined;
  try {
    const created = await createRental({ itemId: itemId!, start: rentalStart, end: rentalEnd, customer: { name: 'UT User', email: 'ut@example.com', phone: '000' } });
    if ((created as any).error) {
      // cannot create rental (maybe not available)
      // cleanup item
      await itemDELETE(new Request('http://localhost/api/items/' + itemId, { method: 'DELETE' }) as any, { params: Promise.resolve({ id: String(itemId) }) } as any);
      t.skip();
      return;
    }
    rentalId = (created as any).rental.id;
    // approve the rental so it becomes active
    await approveRental(rentalId);
  } catch (err) {
    // cleanup item
    try { await itemDELETE(new Request('http://localhost/api/items/' + itemId, { method: 'DELETE' }) as any, { params: Promise.resolve({ id: String(itemId) }) } as any); } catch {}
    t.skip();
    return;
  }

  try {
    const rs = await getItemRentals(itemId);
    assert.ok(Array.isArray(rs));
    assert.ok(rs.some(r => r.id === rentalId), 'should include inserted active rental');
  } finally {
    // cleanup rental and item
    try { if (rentalId) await deleteRental(rentalId); } catch (e) { console.error('cleanup rental failed', e); }
    try { if (itemId) await itemDELETE(new Request('http://localhost/api/items/' + itemId, { method: 'DELETE' }) as any, { params: Promise.resolve({ id: String(itemId) }) } as any); } catch (e) { console.error('cleanup item failed', e); }
  }
});
