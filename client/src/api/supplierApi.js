import { mockSuppliers } from '../data/mockSuppliers.js';

let suppliers = mockSuppliers.map((supplier) => ({ ...supplier }));
let nextId = 1;

export async function fetchSuppliers() {
  return suppliers.map((supplier) => ({ ...supplier }));
}

export async function createSupplier(values) {
  const supplier = { ...values, _id: `supplier-${Date.now()}-${nextId++}` };
  suppliers = [...suppliers, supplier];
  return { ...supplier };
}

export async function updateSupplier(id, values) {
  const index = suppliers.findIndex((supplier) => supplier._id === id);
  if (index < 0) throw new Error('Supplier not found.');

  const updatedSupplier = { ...suppliers[index], ...values, _id: id };
  suppliers = suppliers.map((supplier, supplierIndex) => supplierIndex === index ? updatedSupplier : supplier);
  return { ...updatedSupplier };
}

export async function deleteSupplier(id) {
  const supplier = suppliers.find((item) => item._id === id);
  if (!supplier) throw new Error('Supplier not found.');

  suppliers = suppliers.filter((item) => item._id !== id);
  return { ...supplier };
}
