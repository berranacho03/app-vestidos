import test from 'node:test';
import assert from 'node:assert/strict';
import { hasOverlap } from '../../../lib/RentalManagementSystem';
import { listItems, isItemAvailable, createRental, approveRental, deleteRental } from '../../../lib/RentalManagementSystem';

// Test pure utility hasOverlap

test('hasOverlap devuelve false para intervalos disjuntos', () => {
  const aStart = '2025-01-01';
  const aEnd = '2025-01-03';
  const bStart = '2025-01-04';
  const bEnd = '2025-01-05';
  assert.strictEqual(hasOverlap(aStart, aEnd, bStart, bEnd), false);
});

test('hasOverlap devuelve true para intervalos superpuestos', () => {
  const aStart = '2025-01-01';
  const aEnd = '2025-01-10';
  const bStart = '2025-01-05';
  const bEnd = '2025-01-15';
  assert.strictEqual(hasOverlap(aStart, aEnd, bStart, bEnd), true);
});

test('hasOverlap trata tope fin/inicio como superposición (end == start)', () => {
  const aStart = '2025-01-01';
  const aEnd = '2025-01-05';
  const bStart = '2025-01-05';
  const bEnd = '2025-01-07';
  // According to implementation, an end equal to the other start counts as overlap
  assert.strictEqual(hasOverlap(aStart, aEnd, bStart, bEnd), true);
});

test('hasOverlap funciona cuando los intervalos están invertidos', () => {
  const aStart = '2025-01-10';
  const aEnd = '2025-01-20';
  const bStart = '2025-01-01';
  const bEnd = '2025-01-09';
  assert.strictEqual(hasOverlap(aStart, aEnd, bStart, bEnd), false);
});

test('proceso completo de alquiler (integración)', async (t) => {
  // Attempt to discover an item to use; if none available, skip this integration test.
  const items = await listItems();
  if (!items || items.length === 0) {
    t.skip();
    return;
  }

  const itemId = items[0].id;

  // use dates safely in the future to avoid colliding with existing rentals
  const now = new Date();
  const startDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // +30 days
  const endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 2); // 2 days rental
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const start = fmt(startDate);
  const end = fmt(endDate);

  // ensure item appears available for these dates before creating
  const availableBefore = await isItemAvailable(itemId, start, end);

  let createdId: string | undefined;
  try {
    const customer = { name: 'Test User', email: `test+${Date.now()}@example.com`, phone: '0000000000' };

    const created = await createRental({ itemId, start, end, customer });
    if ((created as any).error) {
      // If creation failed, assert that item was not available
      assert.strictEqual((created as any).error, 'Item is not available for the selected dates.');
      return;
    }

    const rental = (created as any).rental;
    assert.ok(rental?.id, 'rental id should exist');
    createdId = rental.id;
    assert.strictEqual(rental.itemId, itemId);
    assert.strictEqual(rental.status, 'pending');

    // approve the rental and check availability changes
    const okApprove = await approveRental(createdId!);
    if ((okApprove as any).error) {
      throw new Error('approveRental failed: ' + JSON.stringify(okApprove));
    }

    const availableAfter = await isItemAvailable(itemId, start, end);
    assert.strictEqual(availableAfter, false, 'item should NOT be available after approval for overlapping dates');

    // If it was available before, creation should have made it unavailable after approve
    if (availableBefore) {
      assert.notStrictEqual(availableBefore, availableAfter);
    }

    return;
  } finally {
    // cleanup: delete created rental if any
    if (createdId) {
      try {
        await deleteRental(createdId!);
      } catch (e) {
        // best-effort cleanup; don't fail the test on cleanup error
        // eslint-disable-next-line no-console
        console.error('cleanup deleteRental failed', e);
      }
    }
  }
});
