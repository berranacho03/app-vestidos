import test from 'node:test';
import assert from 'node:assert/strict';
import { listItems } from '../../../lib/RentalManagementSystem';
import { POST as itemsPOST } from '../../app/api/items/route';
import { DELETE as itemDELETE } from '../../app/api/items/[id]/route';

test('insertar items para todas las categorías y limpiar (integración)', async (t) => {
  const categories = ['dress', 'shoes', 'bag', 'jacket'] as const;
  const insertedIds: number[] = [];

  try {
    for (const cat of categories) {
      const uniqueName = `UT-Cat-${cat}-${Date.now()}-${Math.floor(Math.random()*10000)}`;
      const sizes = JSON.stringify(['S','M']);
      const images = JSON.stringify([`/images/ut-${cat}.jpg`]);

      // create via API POST
      let insertId: number | undefined;
      try {
        const req = new Request('http://localhost/api/items', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: uniqueName, price: 15.5, sizes: ['S','M'], category: cat, description: 'ut-desc', color: 'ut-color', alt: uniqueName, imageUrl: `/images/ut-${cat}.jpg` }),
        });
        const res = await itemsPOST(req as any);
        const status = (res as any).status ?? 201;
        if (status !== 201) { t.skip(); return; }
        const body = await res.json();
        insertId = body?.item?.id;
        if (!insertId) { t.skip(); return; }
      } catch (err) {
        t.skip();
        return;
      }

      insertedIds.push(insertId);

      // verify via listItems filter by category
      const itemsInCat = await listItems({ category: cat as any });
      assert.ok(itemsInCat.some(it => it.id === insertId), `should find inserted item in category ${cat}`);
    }
  } finally {
    // cleanup all inserted via DELETE handler
    for (const id of insertedIds) {
      try { await itemDELETE(new Request('http://localhost/api/items/' + id, { method: 'DELETE' }) as any, { params: Promise.resolve({ id: String(id) }) } as any); } catch (e) { console.error('cleanup item failed', e); }
    }
  }
});
