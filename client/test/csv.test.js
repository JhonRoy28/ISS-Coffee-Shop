import assert from 'node:assert/strict';
import test from 'node:test';
import { createInventoryCsv } from '../src/utils/inventory.js';
import { createReportCsv } from '../src/utils/reports.js';

const dangerousItem = {
  name: ' =1+1',
  sku: '\t+SUM(1,1)',
  category: '\u0001-1+1',
  quantity: 5,
  unit: '\u0085@SUM(1)',
  unitCost: 10,
  reorderLevel: 2,
  supplier: '\r\n=HYPERLINK("https://example.test","open")',
};

const safeItem = {
  name: 'Espresso Beans',
  sku: 'BEAN-001',
  category: 'Coffee Beans',
  quantity: 5,
  unit: 'kg',
  unitCost: 10,
  reorderLevel: 2,
  supplier: 'Local Roaster',
};

test('report CSV neutralizes formula-leading inventory text before CSV escaping', () => {
  const csv = createReportCsv([dangerousItem]);

  assert.ok(csv.includes(`"'${dangerousItem.name}"`));
  assert.ok(csv.includes(`"'${dangerousItem.sku}"`));
  assert.ok(csv.includes(`"'${dangerousItem.category}"`));
  assert.ok(csv.includes(`"'${dangerousItem.unit}"`));
  assert.ok(csv.includes(`"'\r\n=HYPERLINK(""https://example.test"",""open"")"`));
});

test('inventory CSV neutralizes formula-leading inventory text before CSV escaping', () => {
  const csv = createInventoryCsv([dangerousItem]);

  assert.ok(csv.includes(`"'${dangerousItem.name}"`));
  assert.ok(csv.includes(`"'${dangerousItem.sku}"`));
  assert.ok(csv.includes(`"'${dangerousItem.category}"`));
  assert.ok(csv.includes(`"'${dangerousItem.unit}"`));
  assert.ok(csv.includes(`"'\r\n=HYPERLINK(""https://example.test"",""open"")"`));
});

test('ordinary CSV formatting and report values remain unchanged', () => {
  assert.equal(
    createInventoryCsv([safeItem]),
    '"Item","SKU","Category","Quantity","Unit","Reorder level","Status","Supplier"\n'
      + '"Espresso Beans","BEAN-001","Coffee Beans","5","kg","2","In stock","Local Roaster"'
  );
  assert.equal(
    createReportCsv([safeItem]),
    '"Item name","SKU","Category","Quantity","Unit","Unit cost","Inventory value","Reorder level","Supplier","Stock status"\r\n'
      + '"Espresso Beans","BEAN-001","Coffee Beans","5","kg","10","50","2","Local Roaster","Healthy"'
  );
});
