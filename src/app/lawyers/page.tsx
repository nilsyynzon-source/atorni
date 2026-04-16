import { createClient } from '@/lib/supabase/server'
import LawyerCard from '@/components/LawyerCard'
import { LawyerProfile } from '@/types'
import { LEGAL_SPECIALIZATIONS } from '@/types'
import { Search, SlidersHorizontal } from 'lucide-react'

interface SearchParams {
  q?: string
  specialization?: string
  location?: string
  maxRate?: string
}

export default async function LawyersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createClient()

  let query = supabase
    .from('lawyer_profiles')
    .select('*, profile:profiles(*)')
    .eq('is_accepting_clients', true)

  if (searchParams.specialization) {
    query = query.contains('specializations', [searchParams.specialization])
  }

  if (searchParams.location) {
    query = query.ilike('location', `%${searchParams.location}%`)
  }

  if (searchParams.maxRate) {
    query = query.lte('hourly_rate', parseFloat(searchParams.maxRate))
  }

  const { data: lawyers } = await query.order('created_at', { ascending: false })

  const filtered = searchParams.q
    ? (lawyers || []).filter((l) => {
        const name = l.profile?.full_name?.toLowerCase() || ''
        const bio = l.bio?.toLowerCase() || ''
        const q = searchParams.q!.toLowerCase()
        return name.includes(q) || bio.includes(q)
      })
    : (lawyers || [])

  return (
    <div className="bg-zinc-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 mb-1">Find a Lawyer</h1>
          <p className="text-zinc-500 text-sm">Browse verified attorneys across all practice areas</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-60 flex-shrink-0">
            <div className="bg-white rounded-xl border border-zinc-200 p-5 sticky top-20">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
                <h2 className="font-medium text-zinc-950 text-sm">Filters</h2>
              </div>

              <form method="GET">
                {/* Search */}
                <div className="mb-5">
                  <label className="label">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      name="q"
                      type="text"
                      defaultValue={searchParams.q}
                      className="input pl-9 text-sm"
                      placeholder="Name or keyword"
                    />
                  </div>
                </div>

                {/* Specialization */}
                <div className="mb-5">
                  <label className="label">Practice Area</label>
                  <select
                    name="specialization"
                    defaultValue={searchParams.specialization || ''}
                    className="input text-sm"
                  >
                    <option value="">All areas</option>
                    {LEGAL_SPECIALIZATIONS.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="mb-5">
                  <label className="label">Location</label>
                  <input
                    name="location"
                    type="text"
                    defaultValue={searchParams.location}
                    className="input text-sm"
                    placeholder="City or state"
                  />
                </div>

                {/* Max rate */}
                <div className="mb-6">
                  <label className="label">Max hourly rate ($)</label>
                  <input
                    name="maxRate"
                    type="number"
                    defaultValue={searchParams.maxRate}
                    className="input text-sm"
                    placeholder="e.g. 500"
                    min={0}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full text-sm py-2.5"
                >
                  Apply Filters
                </button>

                {(searchParams.q || searchParams.specialization || searchParams.location || searchParams.maxRate) && (
                  <a
                    href="/lawyers"
                    className="block text-center mt-3 text-sm text-zinc-400 hover:text-zinc-700"
                  >
                    Clear filters
                  </a>
                )}
              </form>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-zinc-500 text-sm">
                <span className="font-semibold text-zinc-950">{filtered.length}</span>{' '}
                {filtered.length === 1 ? 'lawyer' : 'lawyers'} found
                {searchParams.specialization && (
                  <span> in <strong>{searchParams.specialization}</strong></span>
                )}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-zinc-200 p-16 text-center">
                <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-base font-semibold text-zinc-950 mb-2">No lawyers found</h3>
                <p className="text-zinc-500 text-sm mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <a href="/lawyers" className="btn-primary text-sm py-2.5 px-6">
                  Reset Filters
                </a>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {(filtered as LawyerProfile[]).map((lawyer) => (
                  <LawyerCard key={lawyer.id} lawyer={lawyer} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
