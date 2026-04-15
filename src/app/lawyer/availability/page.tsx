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
  startOfDay,
} from 'date-fns'
import { ArrowLeft, Plus, Trash2, Calendar, Clock } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/lawyer/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Availability</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Add time slots when you are available for client sessions.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Add Slots Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Plus className="w-4 h-4" />
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
                    <span className="text-gray-400 font-normal">(1-hour sessions)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {TIME_SLOTS.map(({ label, hour }) => {
                      const isSelected = selectedHours.includes(hour)
                      // Check if this slot already exists for selected date
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
                            'py-2 px-3 rounded-lg text-sm font-medium border transition-all',
                            alreadyExists || isPastHour
                              ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                              : isSelected
                              ? 'border-blue-700 bg-blue-50 text-blue-900'
                              : 'border-gray-200 text-gray-700 hover:border-blue-300'
                          )}
                        >
                          {label}
                          {alreadyExists && (
                            <span className="block text-xs text-gray-300">added</span>
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
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Upcoming Slots ({slots.length})
            </h2>

            {Object.keys(groupedSlots).length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No upcoming slots. Add some using the panel.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                  <div key={date} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      {format(parseISO(`${date}T12:00:00`), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="space-y-2">
                      {dateSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={cn(
                            'flex items-center justify-between px-4 py-3 rounded-xl border',
                            slot.is_booked
                              ? 'bg-green-50 border-green-100'
                              : 'bg-gray-50 border-gray-100'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {format(parseISO(slot.start_time), 'h:mm a')} –{' '}
                              {format(parseISO(slot.end_time), 'h:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {slot.is_booked ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                                Booked
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
