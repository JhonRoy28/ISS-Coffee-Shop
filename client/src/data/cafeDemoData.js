const inDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

export const initialIngredients = [
  { _id: 'ing-1', sku: 'BEAN-ARA-01', name: 'Arabica Espresso Beans', category: 'Coffee Beans', unit: 'kg', quantity: 1.4, reorderLevel: 2, unitCost: 980, supplier: 'Highland Roasters', batches: [{ quantity: 1.4, expirationDate: inDays(90) }], createdAt: inDays(-8) },
  { _id: 'ing-2', sku: 'BEAN-ROB-01', name: 'Robusta Beans', category: 'Coffee Beans', unit: 'kg', quantity: 7.5, reorderLevel: 3, unitCost: 640, supplier: 'Highland Roasters', batches: [{ quantity: 7.5, expirationDate: inDays(120) }], createdAt: inDays(-7) },
  { _id: 'ing-3', sku: 'DAIRY-FRM-01', name: 'Fresh Milk', category: 'Dairy & Alternatives', unit: 'L', quantity: 4, reorderLevel: 5, unitCost: 92, supplier: 'Fresh Fields Dairy', batches: [{ quantity: 4, expirationDate: inDays(3) }], createdAt: inDays(-1) },
  { _id: 'ing-4', sku: 'DAIRY-OAT-01', name: 'Oat Milk', category: 'Dairy & Alternatives', unit: 'cartons', quantity: 4, reorderLevel: 5, unitCost: 155, supplier: 'Fresh Fields Dairy', batches: [{ quantity: 4, expirationDate: inDays(6) }], createdAt: inDays(-1) },
  { _id: 'ing-5', sku: 'DAIRY-CND-01', name: 'Condensed Milk', category: 'Dairy & Alternatives', unit: 'cans', quantity: 14, reorderLevel: 6, unitCost: 78, supplier: 'Fresh Fields Dairy', batches: [{ quantity: 14, expirationDate: inDays(150) }], createdAt: inDays(-4) },
  { _id: 'ing-6', sku: 'SYRUP-VAN-01', name: 'Vanilla Syrup', category: 'Syrups & Sauces', unit: 'bottles', quantity: 3, reorderLevel: 4, unitCost: 230, supplier: 'Sweet Drop Flavors', batches: [{ quantity: 3, expirationDate: inDays(75) }], createdAt: inDays(-2) },
  { _id: 'ing-7', sku: 'SYRUP-CAR-01', name: 'Caramel Sauce', category: 'Syrups & Sauces', unit: 'bottles', quantity: 8, reorderLevel: 4, unitCost: 260, supplier: 'Sweet Drop Flavors', batches: [{ quantity: 8, expirationDate: inDays(80) }], createdAt: inDays(-5) },
  { _id: 'ing-8', sku: 'POW-MAT-01', name: 'Matcha Powder', category: 'Syrups & Sauces', unit: 'kg', quantity: 0.8, reorderLevel: 1, unitCost: 1450, supplier: 'Sweet Drop Flavors', batches: [{ quantity: 0.8, expirationDate: inDays(60) }], createdAt: inDays(-5) },
  { _id: 'ing-9', sku: 'PACK-CUP12', name: '12 oz Cups', category: 'Packaging', unit: 'pcs', quantity: 260, reorderLevel: 100, unitCost: 4.5, supplier: 'Northpoint Packaging', batches: [{ quantity: 260, expirationDate: null }], createdAt: inDays(-6) },
  { _id: 'ing-10', sku: 'PACK-CUP16', name: '16 oz Cups', category: 'Packaging', unit: 'pcs', quantity: 180, reorderLevel: 100, unitCost: 5.2, supplier: 'Northpoint Packaging', batches: [{ quantity: 180, expirationDate: null }], createdAt: inDays(-6) },
  { _id: 'ing-11', sku: 'PACK-LID-01', name: 'Cup Lids', category: 'Packaging', unit: 'pcs', quantity: 300, reorderLevel: 120, unitCost: 2.2, supplier: 'Northpoint Packaging', batches: [{ quantity: 300, expirationDate: null }], createdAt: inDays(-6) },
];

export const initialSuppliers = [
  { _id: 'sup-1', name: 'Highland Roasters', contactPerson: 'Mika Santos', email: 'orders@highland.example', phone: '+63 917 555 0142', category: 'Coffee Beans', leadTime: 3, status: 'active', notes: 'Local specialty roaster' },
  { _id: 'sup-2', name: 'Fresh Fields Dairy', contactPerson: 'Lea Cruz', email: 'hello@freshfields.example', phone: '+63 917 555 0180', category: 'Dairy & Alternatives', leadTime: 1, status: 'active', notes: 'Daily chilled delivery' },
  { _id: 'sup-3', name: 'Sweet Drop Flavors', contactPerson: 'Paolo Reyes', email: 'sales@sweetdrop.example', phone: '+63 917 555 0129', category: 'Syrups & Sauces', leadTime: 4, status: 'active', notes: '' },
  { _id: 'sup-4', name: 'Northpoint Packaging', contactPerson: 'Jamie Wu', email: 'orders@northpoint.example', phone: '+63 917 555 0101', category: 'Packaging', leadTime: 5, status: 'active', notes: '' },
];

export const initialStaff = [
  { _id: 'staff-1', name: 'Rashmi Santos', email: 'rashmi@brewstock.example', role: 'Manager', status: 'Active' },
  { _id: 'staff-2', name: 'Abi Reyes', email: 'abi@brewstock.example', role: 'Barista', status: 'Active' },
  { _id: 'staff-3', name: 'Sir Edward Cruz', email: 'edward@brewstock.example', role: 'Barista', status: 'Active' },
];

export const initialMovements = [
  { _id: 'move-1', ingredientName: 'Fresh Milk', type: 'Stock-Out', quantity: 2, unit: 'L', reason: 'Daily Usage', staffName: 'Abi Reyes', beforeQuantity: 6, afterQuantity: 4, createdAt: inDays(-1) },
  { _id: 'move-2', ingredientName: 'Arabica Espresso Beans', type: 'Stock-In', quantity: 5, unit: 'kg', reason: 'Supplier Delivery', staffName: 'Rashmi Santos', beforeQuantity: 1.4, afterQuantity: 6.4, createdAt: inDays(-2) },
  { _id: 'move-3', ingredientName: 'Oat Milk', type: 'Stock-Out', quantity: 1, unit: 'cartons', reason: 'Daily Usage', staffName: 'Abi Reyes', beforeQuantity: 5, afterQuantity: 4, createdAt: inDays(-2) },
];

export const initialAudit = [
  { _id: 'audit-1', staffName: 'Abi Reyes', role: 'Barista', action: 'Deducted 2 L Fresh Milk — Daily Usage', entity: 'Stock movement', before: '6 L', after: '4 L', createdAt: inDays(-1) },
  { _id: 'audit-2', staffName: 'Rashmi Santos', role: 'Manager', action: 'Received 5 kg Arabica Espresso Beans', entity: 'Stock movement', before: '1.4 kg', after: '6.4 kg', createdAt: inDays(-2) },
  { _id: 'audit-3', staffName: 'Rashmi Santos', role: 'Manager', action: 'Updated Vanilla Syrup reorder level', entity: 'Ingredient', before: '3 bottles', after: '4 bottles', createdAt: inDays(-3) },
];

export const ingredientCategories = [
  'Coffee Beans',
  'Dairy & Alternatives',
  'Syrups & Sauces',
  'Packaging',
];
