'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LEGAL_SPECIALIZATIONS } from '@/types'
import { ArrowLeft, Save, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function LawyerSetupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  // Form state
  const [bio, setBio] = useState('')
  const [specializations, setSpecializations] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [barNumber, setBarNumber] = useState('')
  const [location, setLocation] = useState('')
  const [languages, setLanguages] = useState('English')
  const [website, setWebsite] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [phone, setPhone] = useState('')
  const [isAcceptingClients, setIsAcceptingClients] = useState(true)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: existing } = await supabase
        .from('lawyer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        setProfileId(existing.id)
        setBio(existing.bio || '')
        setSpecializations(existing.specializations || [])
        setHourlyRate(existing.hourly_rate?.toString() || '')
        setYearsExperience(existing.years_experience?.toString() || '')
        setBarNumber(existing.bar_number || '')
        setLocation(existing.location || '')
        setLanguages((existing.languages || ['English']).join(', '))
        setWebsite(existing.website || '')
        setLinkedinUrl(existing.linkedin_url || '')
        setPhone(existing.phone || '')
        setIsAcceptingClients(existing.is_accepting_clients ?? true)
      }
      setLoading(false)
    }
    load()
  }, [router, supabase])

  const toggleSpecialization = (spec: string) => {
    setSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      bio: bio.trim() || null,
      specializations,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      years_experience: yearsExperience ? parseInt(yearsExperience) : null,
      bar_number: barNumber.trim() || null,
      location: location.trim() || null,
      languages: languages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
      website: website.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      phone: phone.trim() || null,
      is_accepting_clients: isAcceptingClients,
    }

    let error
    if (profileId) {
      ;({ error } = await supabase
        .from('lawyer_profiles')
        .update(payload)
        .eq('id', profileId))
    } else {
      const { data, error: insertError } = await supabase
        .from('lawyer_profiles')
        .insert(payload)
        .select()
        .single()
      error = insertError
      if (data) setProfileId(data.id)
    }

    if (error) {
      toast.error('Failed to save profile. Please try again.')
    } else {
      toast.success('Profile saved!')
      router.push('/lawyer/dashboard')
    }
    setSaving(false)
  }

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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/lawyer/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            {profileId ? 'Edit Your Profile' : 'Set Up Your Lawyer Profile'}
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Complete your profile to appear in client searches and start accepting bookings.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-zinc-200 p-8">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-6">Basic Information</h2>
            <div className="space-y-5">
              <div>
                <label className="label">Professional Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input resize-none"
                  rows={5}
                  placeholder="Tell clients about your background, experience, and approach. This is your main pitch."
                  maxLength={2000}
                />
                <p className="text-xs text-zinc-400 mt-1 text-right">{bio.length}/2000</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Hourly Rate (USD)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="input"
                    placeholder="e.g. 250"
                    min={0}
                    max={10000}
                  />
                </div>
                <div>
                  <label className="label">Years of Experience</label>
                  <input
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="input"
                    placeholder="e.g. 10"
                    min={0}
                    max={70}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Bar Number</label>
                  <input
                    type="text"
                    value={barNumber}
                    onChange={(e) => setBarNumber(e.target.value)}
                    className="input"
                    placeholder="e.g. 123456"
                  />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input"
                    placeholder="e.g. New York, NY"
                  />
                </div>
              </div>

              <div>
                <label className="label">Languages (comma-separated)</label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  className="input"
                  placeholder="e.g. English, Spanish, French"
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="input"
                    placeholder="https://yoursite.com"
                  />
                </div>
                <div>
                  <label className="label">LinkedIn URL</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="input"
                    placeholder="https://linkedin.com/in/yourname"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAcceptingClients(!isAcceptingClients)}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors relative',
                    isAcceptingClients ? 'bg-zinc-950' : 'bg-zinc-200'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                      isAcceptingClients ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  />
                </button>
                <label className="text-sm text-zinc-700">
                  Currently accepting new clients
                </label>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-white rounded-xl border border-zinc-200 p-8">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-2">Practice Areas</h2>
            <p className="text-sm text-zinc-500 mb-5">
              Select all areas you practice. This helps clients find you.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LEGAL_SPECIALIZATIONS.map((spec) => {
                const selected = specializations.includes(spec)
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border-2 transition-all text-left',
                      selected
                        ? 'border-zinc-950 bg-zinc-950 text-white'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                    )}
                  >
                    {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    {spec}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link href="/lawyer/dashboard" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
