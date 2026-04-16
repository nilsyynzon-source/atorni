'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AvailabilitySlot } from '@/types'
import {
  format,
  addMinutes,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  parseISO,
  isBefore,
} from 'date-fns'
import { ArrowLeft, Plus, Trash2, Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const hour = 8 + i
  return {
    label: format(setHours(new Date(), hour), 'h:mm a').replace(':00', ''),
    hour,
  }
})

export default function LawyerAvailabilityPage() {
  const router = useRouter()
  const supabase = createClient()

  const [lawyerProfileId, setLawyerProfileId] = useState<string | null>(null)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // New slot form
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedHours, setSelectedHours] = useState<number[]>([])

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: lp } = await supabase
        .from('lawyer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!lp) {
        router.push('/lawyer/setup')
        return
      }

      setLawyerProfileId(lp.id)

      const { data: existingSlots } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('lawyer_id', lp.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })

      setSlots(existingSlots || [])
      setLoading(false)
    }
    load()
  }, [router, supabase])

  const toggleHour = (hour: number) => {
    setSelectedHours((prev) =>
      prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour]
    )
  }

  const handleAddSlots = async () => {
    if (!lawyerProfileId || selectedHours.length === 0) {
      toast.error('Select at least one time slot')
      return
    }

    setSaving(true)

    const dateParts = selectedDate.split('-').map(Number)
    const baseDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])

    const newSlots = selectedHours.map((hour) => {
      const start = setMilliseconds(
        setSeconds(setMinutes(setHours(baseDate, hour), 0), 0),
        0
      )
      const end = addMinutes(start, 60)
      return {
        lawyer_id: lawyerProfileId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      }
    })

    const { data, error } = await supabase
      .from('availability_slots')
      .insert(newSlots)
      .select()

    if (error) {
      toast.error('Failed to add slots. Some may already exist.')
    } else {
      toast.success(`${data.length} slot${data.length > 1 ? 's' : ''} added!`)
      setSlots((prev) =>
        [...prev, ...(data as AvailabilitySlot[])].sort(
          (a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
        )
      )
      setSelectedHours([])
    }
    setSaving(false)
  }

  const handleDeleteSlot = async (slotId: string) => {
    const { error } = await supabase
      .from('availability_slots')
      .delete()
      .eq('id', slotId)

    if (error) {
      toast.error('Failed to delete slot')
    } else {
      setSlots((prev) => prev.filter((s) => s.id !== slotId))
      toast.success('Slot removed')
    }
  }

  // Group upcoming slots by date
  const groupedSlots = slots.reduce<Record<string, AvailabilitySlot[]>>((acc, slot) => {
    const date = format(parseISO(slot.start_time), 'yyyy-MM-dd')
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 min-h-screen">
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/lawyer/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Manage Availability</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Add time slots when you are available for client sessions.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Add Slots Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-zinc-200 p-6 sticky top-20">
              <h2 className="font-medium text-zinc-950 text-sm mb-5 flex items-center gap-2">
                <Plus className="w-4 h-4 text-zinc-400" />
                Add Time Slots
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="label">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setSelectedHours([])
                    }}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">
                    Select Hours{' '}
                    <span className="text-zinc-400 font-normal normal-case">(1-hour sessions)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {TIME_SLOTS.map(({ label, hour }) => {
                      const isSelected = selectedHours.includes(hour)
                      const dateParts = selectedDate.split('-').map(Number)
                      const slotDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
                      const slotStart = setHours(setMinutes(slotDate, 0), hour)
                      const alreadyExists = slots.some((s) => {
                        const sStart = parseISO(s.start_time)
                        return (
                          format(sStart, 'yyyy-MM-dd HH') ===
                          format(slotStart, 'yyyy-MM-dd HH')
                        )
                      })
                      const isPastHour = isBefore(slotStart, new Date())

                      return (
                        <button
                          key={hour}
                          type="button"
                          disabled={alreadyExists || isPastHour}
                          onClick={() => toggleHour(hour)}
                          className={cn(
                            'py-2 px-3 rounded-lg text-xs font-medium border transition-all',
                            alreadyExists || isPastHour
                              ? 'border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed'
                              : isSelected
                              ? 'border-zinc-950 bg-zinc-950 text-white'
                              : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                          )}
                        >
                          {label}
                          {alreadyExists && (
                            <span className="block text-xs text-zinc-300">added</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={handleAddSlots}
                  disabled={saving || selectedHours.length === 0}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {saving ? 'Adding…' : `Add ${selectedHours.length || ''} Slot${selectedHours.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>

          {/* Existing Slots */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming Slots ({slots.length})
            </h2>

            {Object.keys(groupedSlots).length === 0 ? (
              <div className="bg-white rounded-xl border border-zinc-200 p-10 text-center">
                <Clock className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No upcoming slots. Add some using the panel.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                  <div key={date} className="bg-white rounded-xl border border-zinc-200 p-5">
                    <div className="font-medium text-zinc-950 text-sm mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      {format(parseISO(`${date}T12:00:00`), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="space-y-2">
                      {dateSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={cn(
                            'flex items-center justify-between px-4 py-3 rounded-lg border',
                            slot.is_booked
                              ? 'bg-zinc-950 border-zinc-950'
                              : 'bg-zinc-50 border-zinc-100'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className={cn('w-4 h-4', slot.is_booked ? 'text-zinc-400' : 'text-zinc-400')} />
                            <span className={cn('text-sm font-medium', slot.is_booked ? 'text-white' : 'text-zinc-700')}>
                              {format(parseISO(slot.start_time), 'h:mm a')} –{' '}
                              {format(parseISO(slot.end_time), 'h:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {slot.is_booked ? (
                              <span className="text-xs text-zinc-300 font-medium">
                                Booked
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove slot"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
