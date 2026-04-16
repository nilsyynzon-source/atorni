import Link from 'next/link'
import { MapPin, CheckCircle, Briefcase, Clock } from 'lucide-react'
import { LawyerProfile } from '@/types'
import { formatCurrency, getInitials } from '@/lib/utils'

interface LawyerCardProps {
  lawyer: LawyerProfile
}

export default function LawyerCard({ lawyer }: LawyerCardProps) {
  const name = lawyer.profile?.full_name || 'Attorney'
  const initials = getInitials(name)

  return (
    <div className="bg-white rounded-xl border border-zinc-200 hover:border-zinc-400 transition-all p-6 flex flex-col gap-5 group">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 font-semibold text-sm flex-shrink-0 border border-zinc-200">
          {lawyer.profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lawyer.profile.avatar_url}
              alt={name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-zinc-950 text-sm">{name}</h3>
            {lawyer.is_verified && (
              <CheckCircle className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            )}
          </div>
          {lawyer.location && (
            <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400">
              <MapPin className="w-3 h-3" />
              <span>{lawyer.location}</span>
            </div>
          )}
        </div>
        {lawyer.hourly_rate && (
          <div className="text-right flex-shrink-0">
            <div className="font-semibold text-zinc-950 text-sm">{formatCurrency(lawyer.hourly_rate)}</div>
            <div className="text-xs text-zinc-400">/hr</div>
          </div>
        )}
      </div>

      {/* Bio */}
      {lawyer.bio && (
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{lawyer.bio}</p>
      )}

      {/* Specializations */}
      {lawyer.specializations.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {lawyer.specializations.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md"
            >
              {spec}
            </span>
          ))}
          {lawyer.specializations.length > 3 && (
            <span className="text-xs text-zinc-400 py-1">
              +{lawyer.specializations.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1 border-t border-zinc-100">
        {lawyer.years_experience && (
          <div className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            <span>{lawyer.years_experience}y exp.</span>
          </div>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3" />
          <span className={lawyer.is_accepting_clients ? 'text-zinc-600' : 'text-zinc-300'}>
            {lawyer.is_accepting_clients ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/lawyers/${lawyer.id}`}
        className="block w-full text-center bg-zinc-950 text-white text-xs font-medium py-2.5 rounded-lg hover:bg-zinc-800 transition-colors tracking-wide"
      >
        View Profile & Book
      </Link>
    </div>
  )
}
