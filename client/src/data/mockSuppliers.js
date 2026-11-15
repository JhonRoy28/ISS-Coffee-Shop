const SEED_SAMPLE_SUPPLIERS = false;

const sampleSuppliers = [
  { _id: '1', name: 'Northpoint Packaging', contactPerson: 'Jamie Wu', email: 'orders@northpoint.example', phone: '555-0101', category: 'Packaging', leadTime: 5, status: 'active', notes: '' },
  { _id: '2', name: 'Daily Bakehouse', contactPerson: 'Morgan Lee', email: 'hello@dailybakehouse.example', phone: '555-0102', category: 'Bakery', leadTime: 2, status: 'active', notes: '' },
];

export const SUPPLIER_CATEGORIES = [
  'Dairy',
  'Coffee Beans',
  'Cleaning',
  'Packaging',
  'Bakery',
  'Syrups',
];

export const mockSuppliers = SEED_SAMPLE_SUPPLIERS ? sampleSuppliers : [];
