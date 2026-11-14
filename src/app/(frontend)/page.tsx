import config from '@payload-config'
import { getPayload } from 'payload'
import { InventoryDashboard } from './inventory-dashboard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'inventory',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    sort: 'name',
  })

  return <InventoryDashboard initialItems={result.docs} />
}
