'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

const categories = [
  'coffee-beans',
  'dairy',
  'syrups',
  'bakery',
  'packaging',
  'cleaning',
  'other',
] as const
const units = ['kg', 'liters', 'units', 'packs', 'bottles'] as const

type Category = (typeof categories)[number]
type Unit = (typeof units)[number]

export type InventoryActionState = {
  success: boolean
  message: string
  fieldErrors?: Record<string, string>
}

type ValidatedItem = {
  name: string
  sku: string
  category: Category
  stock: number
  unit: Unit
  reorderLevel: number
  unitCost: number
  supplier?: string
  storageLocation?: string
  lastRestocked?: string
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

function validateItem(
  formData: FormData,
): { data: ValidatedItem } | { errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const name = text(formData, 'name')
  const sku = text(formData, 'sku').toUpperCase()
  const category = text(formData, 'category')
  const unit = text(formData, 'unit')
  const stockValue = text(formData, 'stock')
  const reorderValue = text(formData, 'reorderLevel')
  const costValue = text(formData, 'unitCost')
  const stock = Number(stockValue)
  const reorderLevel = Number(reorderValue)
  const unitCost = Number(costValue)

  if (!name || name.length > 80) errors.name = 'Enter a name up to 80 characters.'
  if (!/^[A-Z0-9][A-Z0-9-]{1,23}$/.test(sku)) {
    errors.sku = 'Use 2–24 letters, numbers, or hyphens.'
  }
  if (!categories.includes(category as Category)) errors.category = 'Choose a category.'
  if (!units.includes(unit as Unit)) errors.unit = 'Choose a unit.'
  if (stockValue === '' || !Number.isFinite(stock) || stock < 0) {
    errors.stock = 'Stock must be zero or more.'
  }
  if (reorderValue === '' || !Number.isFinite(reorderLevel) || reorderLevel < 0) {
    errors.reorderLevel = 'Reorder level must be zero or more.'
  }
  if (costValue === '' || !Number.isFinite(unitCost) || unitCost < 0) {
    errors.unitCost = 'Unit cost must be zero or more.'
  }

  const supplier = text(formData, 'supplier')
  const storageLocation = text(formData, 'storageLocation')
  const lastRestocked = text(formData, 'lastRestocked')
  if (supplier.length > 80) errors.supplier = 'Use 80 characters or fewer.'
  if (storageLocation.length > 80) {
    errors.storageLocation = 'Use 80 characters or fewer.'
  }
  if (lastRestocked && Number.isNaN(Date.parse(lastRestocked))) {
    errors.lastRestocked = 'Choose a valid date.'
  }

  if (Object.keys(errors).length) return { errors }
  return {
    data: {
      name,
      sku,
      category: category as Category,
      stock,
      unit: unit as Unit,
      reorderLevel,
      unitCost,
      supplier: supplier || undefined,
      storageLocation: storageLocation || undefined,
      lastRestocked: lastRestocked || undefined,
    },
  }
}

function payloadError(error: unknown): InventoryActionState {
  const message = error instanceof Error ? error.message : ''
  if (message.toLowerCase().includes('unique') || message.toLowerCase().includes('duplicate')) {
    return {
      success: false,
      message: 'That SKU is already in use.',
      fieldErrors: { sku: 'Choose a unique SKU.' },
    }
  }
  return { success: false, message: 'We couldn’t save that item. Please try again.' }
}

export async function createInventoryItem(formData: FormData): Promise<InventoryActionState> {
  const validated = validateItem(formData)
  if ('errors' in validated) {
    return {
      success: false,
      message: 'Check the highlighted fields.',
      fieldErrors: validated.errors,
    }
  }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'inventory',
      data: validated.data,
      overrideAccess: false,
    })
    return { success: true, message: `${validated.data.name} was added to inventory.` }
  } catch (error) {
    return payloadError(error)
  }
}

export async function updateInventoryItem(formData: FormData): Promise<InventoryActionState> {
  const id = text(formData, 'id')
  if (!id) return { success: false, message: 'The inventory item could not be identified.' }
  const validated = validateItem(formData)
  if ('errors' in validated) {
    return {
      success: false,
      message: 'Check the highlighted fields.',
      fieldErrors: validated.errors,
    }
  }

  try {
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'inventory',
      id,
      data: validated.data,
      overrideAccess: false,
    })
    return { success: true, message: `${validated.data.name} was updated.` }
  } catch (error) {
    return payloadError(error)
  }
}

export async function deleteInventoryItem(id: string): Promise<InventoryActionState> {
  if (!id) return { success: false, message: 'The inventory item could not be identified.' }
  try {
    const payload = await getPayload({ config })
    await payload.delete({
      collection: 'inventory',
      id,
      overrideAccess: false,
    })
    return { success: true, message: 'The inventory item was deleted.' }
  } catch {
    return { success: false, message: 'We couldn’t delete that item. Please try again.' }
  }
}
