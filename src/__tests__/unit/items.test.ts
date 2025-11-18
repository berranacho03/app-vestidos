import test from 'node:test';
import assert from 'node:assert/strict';
import { listItems } from '../../../lib/RentalManagementSystem';
import { query } from '../../../lib/db';

test('items filtering returns expected results (integration with DB)', async (t) => {
  // Create a unique test item in DB, run filters against it, then clean up.
  const uniqueName = `TestItem-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  const sizes = JSON.stringify(['XS', 'S']);
  const images = JSON.stringify(['/images/test1.jpg']);
  const style = 'filter-test-style';
  const color = 'purple-test-color';

  // Insert test item
  try {
    await query(
      `INSERT INTO Items (name, pricePerDay, sizes, category, style, description, color, alt, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uniqueName, 9.99, sizes, 'dress', style, 'desc test item', color, uniqueName, images]
    );
  } catch (err) {
    // If DB not available or insert fails, skip the test to avoid breaking environment
    t.skip();
    return;
  }

  // Find the inserted item id
  let rows: any[];
  try {
    rows = await query('SELECT id FROM Items WHERE name = ?', [uniqueName]);
    if (!rows || rows.length === 0) {
      t.skip();
      return;
    }
  } catch (err) {
    t.skip();
    return;
  }

  const itemId = rows[0].id;

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
    // Cleanup: remove the test item
    try {
      await query('DELETE FROM Items WHERE id = ?', [itemId]);
    } catch (e) {
      // best-effort cleanup
      // eslint-disable-next-line no-console
      console.error('Failed to cleanup test item', e);
    }
  }
});
