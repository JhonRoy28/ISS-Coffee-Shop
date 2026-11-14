'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Inventory } from '@/payload-types'
import {
  createInventoryItem,
  deleteInventoryItem,
  updateInventoryItem,
  type InventoryActionState,
} from './actions'

const categoryLabels: Record<Inventory['category'], string> = {
  'coffee-beans': 'Coffee beans',
  dairy: 'Dairy & alternatives',
  syrups: 'Syrups & flavors',
  bakery: 'Bakery',
  packaging: 'Packaging',
  cleaning: 'Cleaning',
  other: 'Other',
}

type IconName =
  | 'box'
  | 'chevron'
  | 'coffee'
  | 'dots'
  | 'download'
  | 'edit'
  | 'plus'
  | 'search'
  | 'trash'
  | 'trend'
  | 'warning'
  | 'x'

function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    box: (
      <>
        <path d="m21 8-9 5-9-5" />
        <path d="M3 8l9-5 9 5v8l-9 5-9-5Z" />
        <path d="M12 13v8" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    coffee: (
      <>
        <path d="M10 2v2M14 2v2" />
        <path d="M4 7h13v7a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6Z" />
        <path d="M17 9h1a3 3 0 0 1 0 6h-1" />
      </>
    ),
    dots: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="m16.5 3.5 4 4L8 20l-5 1 1-5Z" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),
    trend: (
      <>
        <path d="M3 17 9 11l4 4 8-9" />
        <path d="M15 6h6v6" />
      </>
    ),
    warning: (
      <>
        <path d="M12 3 2 21h20Z" />
        <path d="M12 9v5M12 18h.01" />
      </>
    ),
    x: <path d="m6 6 12 12M18 6 6 18" />,
  }
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function getStockStatus(item: Inventory) {
  if (item.stock === 0)
    return { label: 'Out of stock', color: 'bg-[#071528] text-white', dot: 'bg-[#D2B34C]' }
  if (item.stock <= item.reorderLevel)
    return { label: 'Low stock', color: 'bg-[#F4F0E2] text-[#12314C]', dot: 'bg-[#2B5D7A]' }
  return { label: 'In stock', color: 'bg-[#F4F0E2] text-[#12314C]', dot: 'bg-[#D2B34C]' }
}

function toDateInput(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : ''
}

function InventoryForm({ item, onClose }: { item: Inventory | null; onClose: () => void }) {
  const router = useRouter()
  const [state, setState] = useState<InventoryActionState | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = item
        ? await updateInventoryItem(formData)
        : await createInventoryItem(formData)
      setState(result)
      if (result.success) {
        router.refresh()
        onClose()
      }
    })
  }

  const field = (name: string) => state?.fieldErrors?.[name]
  const inputClass = (name: string) =>
    `mt-2 w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-[#071528] outline-none transition placeholder:text-[#12314C] focus:ring-2 ${
      field(name)
        ? 'border-[#071528] focus:ring-[#071528]/20'
        : 'border-[#2B5D7A]/35 focus:border-[#12314C] focus:ring-[#12314C]/20'
    }`

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#071528]/35 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-form-title"
    >
      <div className="h-full w-full max-w-[520px] overflow-y-auto bg-[#FFFFFF] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2B5D7A]/35 bg-[#FFFFFF]/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#12314C]">
              {item ? 'Edit stock record' : 'New stock record'}
            </p>
            <h2
              id="inventory-form-title"
              className="mt-1 font-serif text-2xl font-semibold text-[#071528]"
            >
              {item ? item.name : 'Add inventory item'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-[#2B5D7A]/35 text-[#12314C] transition hover:bg-white hover:text-[#071528]"
            aria-label="Close form"
          >
            <Icon name="x" />
          </button>
        </div>

        <form action={submit} className="space-y-5 p-6">
          {item && <input type="hidden" name="id" value={item.id} />}
          {state && !state.success && (
            <div
              className="rounded-xl border border-[#2B5D7A]/35 bg-[#F4F0E2] px-4 py-3 text-sm text-[#071528]"
              role="alert"
            >
              {state.message}
            </div>
          )}
          <label className="block text-sm font-semibold text-[#071528]">
            Item name
            <input
              name="name"
              defaultValue={item?.name ?? ''}
              className={inputClass('name')}
              placeholder="Ethiopian single origin"
            />
            {field('name') && (
              <span className="mt-1 block text-xs text-[#071528]">{field('name')}</span>
            )}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#071528]">
              SKU
              <input
                name="sku"
                defaultValue={item?.sku ?? ''}
                className={inputClass('sku')}
                placeholder="BEAN-ETH-01"
              />
              {field('sku') && (
                <span className="mt-1 block text-xs text-[#071528]">{field('sku')}</span>
              )}
            </label>
            <label className="block text-sm font-semibold text-[#071528]">
              Category
              <select
                name="category"
                defaultValue={item?.category ?? 'coffee-beans'}
                className={inputClass('category')}
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-semibold text-[#071528]">
              On hand
              <input
                name="stock"
                type="number"
                min="0"
                step="0.01"
                defaultValue={item?.stock ?? 0}
                className={inputClass('stock')}
              />
              {field('stock') && (
                <span className="mt-1 block text-xs text-[#071528]">{field('stock')}</span>
              )}
            </label>
            <label className="block text-sm font-semibold text-[#071528]">
              Unit
              <select
                name="unit"
                defaultValue={item?.unit ?? 'units'}
                className={inputClass('unit')}
              >
                {['kg', 'liters', 'units', 'packs', 'bottles'].map((unit) => (
                  <option key={unit}>{unit}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-[#071528]">
              Reorder at
              <input
                name="reorderLevel"
                type="number"
                min="0"
                step="0.01"
                defaultValue={item?.reorderLevel ?? 5}
                className={inputClass('reorderLevel')}
              />
              {field('reorderLevel') && (
                <span className="mt-1 block text-xs text-[#071528]">{field('reorderLevel')}</span>
              )}
            </label>
          </div>
          <label className="block text-sm font-semibold text-[#071528]">
            Unit cost (PHP)
            <input
              name="unitCost"
              type="number"
              min="0"
              step="0.01"
              defaultValue={item?.unitCost ?? 0}
              className={inputClass('unitCost')}
            />
            {field('unitCost') && (
              <span className="mt-1 block text-xs text-[#071528]">{field('unitCost')}</span>
            )}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#071528]">
              Supplier <span className="font-normal text-[#12314C]">(optional)</span>
              <input
                name="supplier"
                defaultValue={item?.supplier ?? ''}
                className={inputClass('supplier')}
                placeholder="Supplier name"
              />
            </label>
            <label className="block text-sm font-semibold text-[#071528]">
              Storage <span className="font-normal text-[#12314C]">(optional)</span>
              <input
                name="storageLocation"
                defaultValue={item?.storageLocation ?? ''}
                className={inputClass('storageLocation')}
                placeholder="Dry store · Shelf A"
              />
            </label>
          </div>
          <label className="block text-sm font-semibold text-[#071528]">
            Last restocked <span className="font-normal text-[#12314C]">(optional)</span>
            <input
              name="lastRestocked"
              type="date"
              defaultValue={toDateInput(item?.lastRestocked)}
              className={inputClass('lastRestocked')}
            />
          </label>
          <div className="flex gap-3 border-t border-[#2B5D7A]/35 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#2B5D7A]/35 px-4 py-3 text-sm font-semibold text-[#12314C] hover:bg-white"
            >
              Cancel
            </button>
            <button
              disabled={pending}
              className="flex-[1.4] rounded-xl bg-[#2B5D7A] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12314C] disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? 'Saving…' : item ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function InventoryDashboard({ initialItems }: { initialItems: Inventory[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Inventory | null>(null)
  const [menu, setMenu] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return initialItems.filter((item) => {
      const matchesCategory = category === 'all' || item.category === category
      const matchesSearch =
        !search ||
        [item.name, item.sku, item.supplier].some((value) => value?.toLowerCase().includes(search))
      return matchesCategory && matchesSearch
    })
  }, [category, initialItems, query])

  const inStockItems = initialItems.filter((item) => item.stock > item.reorderLevel)
  const lowStockItems = initialItems.filter(
    (item) => item.stock > 0 && item.stock <= item.reorderLevel,
  )
  const outOfStockItems = initialItems.filter((item) => item.stock === 0)
  const alertItems = [...outOfStockItems, ...lowStockItems]
  const recentItems = [...initialItems]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
  const chartRows = [
    { label: 'In stock', value: inStockItems.length, color: 'bg-[#2B5D7A]' },
    { label: 'Low stock', value: lowStockItems.length, color: 'bg-[#D2B34C]' },
    { label: 'Out of stock', value: outOfStockItems.length, color: 'bg-[#071528]' },
  ]
  const chartMax = Math.max(1, ...chartRows.map((row) => row.value))

  function edit(item: Inventory) {
    setSelected(item)
    setModal('edit')
    setMenu(null)
  }

  function remove(item: Inventory) {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteInventoryItem(item.id)
      setNotice(result.message)
      setMenu(null)
      if (result.success) router.refresh()
    })
  }

  function exportCsv() {
    const rows = [
      ['Name', 'SKU', 'Category', 'Stock', 'Unit', 'Reorder level', 'Unit cost', 'Supplier'],
      ...filtered.map((item) => [
        item.name,
        item.sku,
        categoryLabels[item.category],
        item.stock,
        item.unit,
        item.reorderLevel,
        item.unitCost,
        item.supplier ?? '',
      ]),
    ]
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'brewstock-inventory.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="brewstock-inter min-h-screen bg-[#F4F0E2] text-[#071528]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .brewstock-inter,
        .brewstock-inter * {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <header className="border-b border-[#2B5D7A]/35 bg-[#FFFFFF]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between bg-white px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#071528] text-white">
              <Icon name="coffee" />
            </div>
            <div>
              <p className="font-serif text-xl font-bold leading-none tracking-tight">Brewstock</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#12314C]">
                Cafe inventory
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="max-w-28 text-xs font-semibold leading-tight text-[#071528] sm:max-w-none sm:text-sm">
                  National University
                </p>
                <p className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.12em] text-[#12314C] sm:block">
                  Account
                </p>
              </div>
              <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-[#2B5D7A]/35 bg-white shadow-sm">
                <Image
                  src="/national-university-logo.png"
                  alt="National University crest"
                  width={474}
                  height={533}
                  className="h-full w-full object-contain p-1"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] bg-[#F4F0E2] px-5 py-8 md:px-8 md:py-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#12314C]">
              Operations / Inventory
            </p>
            <h1 className="font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              Inventory overview
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#12314C]">
              Keep an eye on stock levels, costs, and the ingredients that keep your cafe moving.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-xl border border-[#2B5D7A]/35 bg-[#FFFFFF] px-4 py-3 text-sm font-semibold shadow-sm transition hover:bg-white"
            >
              <Icon name="download" className="size-4" /> Export
            </button>
            <button
              onClick={() => {
                setSelected(null)
                setModal('create')
              }}
              className="flex items-center gap-2 rounded-xl bg-[#2B5D7A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12314C]"
            >
              <Icon name="plus" className="size-4" /> Add item
            </button>
          </div>
        </div>

        {notice && (
          <button
            onClick={() => setNotice('')}
            className="mt-6 flex w-full items-center justify-between rounded-xl border border-[#2B5D7A]/35 bg-[#F4F0E2] px-4 py-3 text-left text-sm text-[#071528]"
          >
            {notice}
            <Icon name="x" className="size-4" />
          </button>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total',
              value: initialItems.length.toString(),
              detail: 'Unique stock records',
              icon: 'box' as IconName,
              tone: 'bg-[#D2B34C]/10 text-[#2B5D7A]',
            },
            {
              label: 'In stock',
              value: inStockItems.length.toString(),
              detail: 'Above reorder level',
              icon: 'trend' as IconName,
              tone: 'bg-[#D2B34C]/10 text-[#2B5D7A]',
            },
            {
              label: 'Low stock',
              value: lowStockItems.length.toString(),
              detail: 'At or below reorder level',
              icon: 'warning' as IconName,
              tone: 'bg-[#D2B34C]/10 text-[#2B5D7A]',
            },
            {
              label: 'Out of stock',
              value: outOfStockItems.length.toString(),
              detail: 'Needs immediate restock',
              icon: 'x' as IconName,
              tone: 'bg-[#D2B34C]/10 text-[#2B5D7A]',
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-[#2B5D7A]/35 bg-[#FFFFFF] p-5 shadow-[0_1px_2px_rgba(7,21,40,.05)]"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-[#12314C]">{card.label}</p>
                <span className={`grid size-9 place-items-center rounded-xl ${card.tone}`}>
                  <Icon name={card.icon} className="size-4" />
                </span>
              </div>
              <p className="mt-4 font-serif text-3xl font-semibold tracking-tight">{card.value}</p>
              <p className="mt-1 text-xs text-[#12314C]">{card.detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-[#2B5D7A]/35 bg-[#FFFFFF] p-5 shadow-[0_1px_3px_rgba(7,21,40,.06)] md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#12314C]">
                Stock health
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#071528]">Stock level chart</h2>
            </div>
            <span className="rounded-full bg-[#F4F0E2] px-3 py-1 text-xs font-semibold text-[#12314C]">
              {initialItems.length} total
            </span>
          </div>
          <div className="mt-6 space-y-5">
            {chartRows.map((row) => (
              <div key={row.label} className="grid grid-cols-[88px_1fr_28px] items-center gap-3">
                <span className="text-sm font-medium text-[#12314C]">{row.label}</span>
                <div className="h-3 overflow-hidden rounded-full bg-[#F4F0E2]/60">
                  <div
                    className={`h-full min-w-1 rounded-full transition-all ${row.color}`}
                    style={{ width: `${(row.value / chartMax) * 100}%` }}
                  />
                </div>
                <span className="text-right text-sm font-bold text-[#071528]">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#2B5D7A]/35 bg-[#FFFFFF] p-5 shadow-[0_1px_3px_rgba(7,21,40,.06)] md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#12314C]">
                Attention required
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#071528]">Low stock alerts</h2>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-[#D2B34C]/15 text-[#2B5D7A]">
              <Icon name="warning" className="size-4" />
            </span>
          </div>
          {alertItems.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {alertItems.map((item) => {
                const status = getStockStatus(item)
                return (
                  <button
                    key={item.id}
                    onClick={() => edit(item)}
                    className="flex items-center justify-between gap-4 rounded-xl border border-[#2B5D7A]/25 bg-white p-4 text-left transition hover:border-[#2B5D7A]/60 hover:bg-[#F4F0E2]/30"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-[#071528]">
                        {item.name}
                      </span>
                      <span className="mt-1 block text-xs text-[#12314C]">
                        {item.stock} {item.unit} remaining · reorder at {item.reorderLevel}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-[#F4F0E2]/35 px-4 py-5 text-sm text-[#12314C]">
              All inventory items are above their reorder levels.
            </p>
          )}
        </section>

        <section className="mt-6 overflow-visible rounded-2xl border border-[#2B5D7A]/35 bg-[#FFFFFF] shadow-[0_1px_3px_rgba(7,21,40,.06)]">
          <div className="border-b border-[#2B5D7A]/35 px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#12314C]">
              Stock records
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#071528]">Inventory table</h2>
          </div>
          <div className="flex flex-col gap-3 border-b border-[#2B5D7A]/35 p-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Icon
                name="search"
                className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#12314C]"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search items, SKUs, or suppliers…"
                className="w-full rounded-xl border border-[#2B5D7A]/35 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#12314C] focus:border-[#12314C] focus:ring-2 focus:ring-[#12314C]/15"
              />
            </div>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-[#2B5D7A]/35 bg-white px-4 py-2.5 text-sm font-medium text-[#12314C] outline-none focus:border-[#12314C]"
            >
              <option value="all">All categories</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="grid min-h-72 place-items-center px-6 text-center">
              <div>
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F4F0E2] text-[#12314C]">
                  <Icon name="box" />
                </div>
                <h2 className="mt-4 font-serif text-xl font-semibold">
                  {initialItems.length ? 'No matching items' : 'Your shelves are ready'}
                </h2>
                <p className="mt-2 text-sm text-[#12314C]">
                  {initialItems.length
                    ? 'Try a different search or category.'
                    : 'Add your first inventory item to start tracking stock.'}
                </p>
                {!initialItems.length && (
                  <button
                    onClick={() => setModal('create')}
                    className="mt-5 rounded-xl bg-[#2B5D7A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12314C]"
                  >
                    Add first item
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-[#2B5D7A]/35 text-[11px] font-bold uppercase tracking-[0.12em] text-[#12314C]">
                    <th className="px-5 py-4">Item</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Stock</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="w-20 px-4 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const status = getStockStatus(item)
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-[#2B5D7A]/35 transition last:border-0 hover:bg-[#F4F0E2]"
                      >
                        <td className="px-5 py-4">
                          <button onClick={() => edit(item)} className="text-left">
                            <span className="block text-sm font-semibold text-[#071528] hover:text-[#071528]">
                              {item.name}
                            </span>
                            <span className="mt-1 block font-mono text-[11px] text-[#12314C]">
                              {item.sku}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#12314C]">
                          {categoryLabels[item.category]}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold">
                            {item.stock.toLocaleString()}
                          </span>
                          <span className="ml-1 text-xs text-[#12314C]">{item.unit}</span>
                          <span className="mt-1 block text-[11px] text-[#12314C]">
                            Reorder at {item.reorderLevel}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}
                          >
                            <span className={`size-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="relative px-4 py-4">
                          <button
                            onClick={() => setMenu(menu === item.id ? null : item.id)}
                            className="grid size-8 place-items-center rounded-lg text-[#12314C] hover:bg-[#F4F0E2]"
                            aria-label={`Actions for ${item.name}`}
                          >
                            <Icon name="dots" className="size-5" />
                          </button>
                          {menu === item.id && (
                            <div className="absolute right-4 top-12 z-20 w-36 overflow-hidden rounded-xl border border-[#2B5D7A]/35 bg-white p-1.5 shadow-xl">
                              <button
                                onClick={() => edit(item)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#F4F0E2]"
                              >
                                <Icon name="edit" className="size-4" /> Edit
                              </button>
                              <button
                                disabled={pending}
                                onClick={() => remove(item)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#071528] hover:bg-[#F4F0E2] disabled:opacity-50"
                              >
                                <Icon name="trash" className="size-4" /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-[#2B5D7A]/35 px-5 py-4 text-xs text-[#12314C]">
            <span>
              Showing {filtered.length} of {initialItems.length} items
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              Live data from Payload <Icon name="chevron" className="size-3" />
            </span>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#2B5D7A]/35 bg-[#FFFFFF] p-5 shadow-[0_1px_3px_rgba(7,21,40,.06)] md:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#12314C]">
              Latest updates
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#071528]">
              Recent inventory activities
            </h2>
          </div>
          {recentItems.length ? (
            <div className="mt-5 divide-y divide-[#2B5D7A]/20">
              {recentItems.map((item) => {
                const isNew = item.createdAt === item.updatedAt
                return (
                  <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#F4F0E2] text-[#2B5D7A]">
                      <Icon name={isNew ? 'plus' : 'edit'} className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#071528]">
                        {isNew ? 'Added' : 'Updated'} {item.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[#12314C]">
                        {item.stock} {item.unit} on hand · {categoryLabels[item.category]}
                      </p>
                    </div>
                    <time className="shrink-0 text-xs text-[#12314C]">
                      {new Intl.DateTimeFormat('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC',
                      }).format(new Date(item.updatedAt))}
                    </time>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mt-5 text-sm text-[#12314C]">No inventory activity yet.</p>
          )}
        </section>
      </div>
      {modal && (
        <InventoryForm
          item={selected}
          onClose={() => {
            setModal(null)
            setSelected(null)
          }}
        />
      )}
    </main>
  )
}
