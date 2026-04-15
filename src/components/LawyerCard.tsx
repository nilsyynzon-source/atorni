import Link from 'next/link'
import { MapPin, Star, Clock, CheckCircle, Briefcase } from 'lucide-react'
import { LawyerProfile } from '@/types'
import { formatCurrency, getInitials } from '@/lib/utils'

interface LawyerCardProps {
  lawyer: LawyerProfile
}

export default function LawyerCard({ lawyer }: LawyerCardProps) {
  const name = lawyer.profile?.full_name || 'Attorney'
  const initials = getInitials(name)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-900 font-bold text-lg flex-shrink-0">
          {lawyer.profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lawyer.profile.avatar_url}
              alt={name}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
            {lawyer.is_verified && (
              <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
          {lawyer.location && (
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{lawyer.location}</span>
            </div>
          )}
        </div>
        {lawyer.hourly_rate && (
          <div className="text-right flex-shrink-0">
            <div className="font-bold text-blue-900 text-lg">
              {formatCurrency(lawyer.hourly_rate)}
            </div>
            <div className="text-xs text-gray-500">/hour</div>
          </div>
        )}
      </div>

      {/* Bio */}
      {lawyer.bio && (
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{lawyer.bio}</p>
      )}

      {/* Specializations */}
      {lawyer.specializations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {lawyer.specializations.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium"
            >
              {spec}
            </span>
          ))}
          {lawyer.specializations.length > 3 && (
            <span className="text-xs text-gray-400 py-1">
              +{lawyer.specializations.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-50 pt-4">
        {lawyer.years_experience && (
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{lawyer.years_experience}y exp.</span>
          </div>
        )}
        {lawyer.languages.length > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            <span>{lawyer.languages.join(', ')}</span>
          </div>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <Clock className="w-3.5 h-3.5 text-green-500" />
          <span className={lawyer.is_accepting_clients ? 'text-green-600' : 'text-gray-400'}>
            {lawyer.is_accepting_clients ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/lawyers/${lawyer.id}`}
        className="block w-full text-center bg-blue-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-blue-800 transition-colors"
      >
        View Profile & Book
      </Link>
    </div>
  )
}
