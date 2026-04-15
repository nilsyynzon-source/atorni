'use client'

import { useState, useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isPast,
  startOfDay,
  parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AvailabilitySlot } from '@/types'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface BookingCalendarProps {
  slots: AvailabilitySlot[]
  onSlotSelect: (slot: AvailabilitySlot) => void
  selectedSlot: AvailabilitySlot | null
}

export default function BookingCalendar({
  slots,
  onSlotSelect,
  selectedSlot,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const availableDates = useMemo(() => {
    return slots
      .filter((s) => !s.is_booked)
      .map((s) => startOfDay(parseISO(s.start_time)).getTime())
  }, [slots])

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    })
  }, [currentMonth])

  const startPadding = useMemo(() => {
    const day = startOfMonth(currentMonth).getDay()
    return Array(day).fill(null)
  }, [currentMonth])

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const slotsForDate = useMemo(() => {
    if (!selectedDate) return []
    return slots
      .filter((s) => !s.is_booked && isSameDay(parseISO(s.start_time), selectedDate))
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
  }, [slots, selectedDate])

  const hasSlots = (date: Date) => {
    return availableDates.includes(startOfDay(date).getTime())
  }

  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {startPadding.map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {daysInMonth.map((date) => {
            const past = isPast(startOfDay(date)) && !isToday(date)
            const available = hasSlots(date)
            const selected = selectedDate && isSameDay(date, selectedDate)
            const today = isToday(date)

            return (
              <button
                key={date.toISOString()}
                onClick={() => {
                  if (!past && available) {
                    setSelectedDate(date)
                  }
                }}
                disabled={past || !available}
                className={cn(
                  'relative aspect-square rounded-lg text-sm font-medium transition-all',
                  'flex items-center justify-center',
                  past || !available
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'cursor-pointer',
                  selected
                    ? 'bg-blue-900 text-white'
                    : available && !past
                    ? 'hover:bg-blue-50 text-gray-900'
                    : '',
                  today && !selected ? 'ring-2 ring-blue-900 ring-offset-1' : ''
                )}
              >
                {format(date, 'd')}
                {available && !past && !selected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                )}
              </button>
            )
          })}
        </div>

        <p className="mt-3 text-xs text-gray-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          Dates with available slots
        </p>
      </div>

      {/* Time Slots */}
      <div>
        {selectedDate ? (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Available times for {format(selectedDate, 'MMMM d')}
            </h3>
            {slotsForDate.length === 0 ? (
              <p className="text-gray-500 text-sm">No available slots on this date.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {slotsForDate.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => onSlotSelect(slot)}
                    className={cn(
                      'py-3 px-4 rounded-xl text-sm font-medium border transition-all',
                      selectedSlot?.id === slot.id
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    )}
                  >
                    {formatTime(slot.start_time)}
                    <span className="block text-xs opacity-70">
                      – {formatTime(slot.end_time)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <ChevronRight className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-gray-500 text-sm">Select a highlighted date to see available time slots</p>
          </div>
        )}
      </div>
    </div>
  )
}
