import type { CollectionConfig } from 'payload'

export const Inventory: CollectionConfig = {
  slug: 'inventory',
  admin: {
    group: 'Cafe operations',
    useAsTitle: 'name',
    defaultColumns: ['name', 'sku', 'category', 'stock', 'reorderLevel', 'updatedAt'],
  },
  access: {
    // Brewstock is currently a shared internal tool with no app-level accounts.
    // Keep these explicit so adding staff authentication later is a deliberate change.
    create: () => true,
    delete: () => true,
    read: () => true,
    update: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 80,
    },
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: 24,
      admin: {
        description: 'A unique stock keeping code, such as BEAN-ETH-01.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Coffee beans', value: 'coffee-beans' },
        { label: 'Dairy & alternatives', value: 'dairy' },
        { label: 'Syrups & flavors', value: 'syrups' },
        { label: 'Bakery', value: 'bakery' },
        { label: 'Packaging', value: 'packaging' },
        { label: 'Cleaning', value: 'cleaning' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'stock',
          type: 'number',
          required: true,
          min: 0,
          admin: { width: '50%' },
        },
        {
          name: 'unit',
          type: 'select',
          required: true,
          admin: { width: '50%' },
          options: [
            { label: 'kg', value: 'kg' },
            { label: 'liters', value: 'liters' },
            { label: 'units', value: 'units' },
            { label: 'packs', value: 'packs' },
            { label: 'bottles', value: 'bottles' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'reorderLevel',
          type: 'number',
          required: true,
          min: 0,
          admin: { width: '50%' },
        },
        {
          name: 'unitCost',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            width: '50%',
            description: 'Cost in USD per inventory unit.',
          },
        },
      ],
    },
    {
      name: 'supplier',
      type: 'text',
      maxLength: 80,
    },
    {
      name: 'storageLocation',
      type: 'text',
      maxLength: 80,
    },
    {
      name: 'lastRestocked',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'MMM d, yyyy' },
      },
    },
  ],
  timestamps: true,
  versions: false,
}
