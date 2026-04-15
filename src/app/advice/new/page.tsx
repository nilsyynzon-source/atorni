'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ADVICE_CATEGORIES } from '@/types'
import { ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewAdvicePostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login?redirectTo=/advice/new')
      return
    }

    const { data, error } = await supabase
      .from('advice_posts')
      .insert({
        author_id: user.id,
        title: title.trim(),
        content: content.trim(),
        category: category || null,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to post question. Please try again.')
      setLoading(false)
      return
    }

    toast.success('Your question has been posted!')
    router.push(`/advice/${data.id}`)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/advice"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Q&A
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ask a Legal Question</h1>
          <p className="text-gray-500 text-sm mb-8">
            Be specific and include relevant details. Our lawyers typically respond within 24 hours.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Practice Area</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                <option value="">Select a category (optional)</option>
                {ADVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                Your Question <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g. Can my landlord withhold my security deposit?"
                required
                maxLength={200}
              />
              <p className="text-xs text-gray-400 mt-1">{title.length}/200</p>
            </div>

            <div>
              <label className="label">
                Describe your situation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input resize-none"
                rows={6}
                placeholder="Provide as much detail as possible. Include relevant dates, locations, and what has already happened. The more specific you are, the better the advice you'll receive."
                required
                minLength={50}
                maxLength={5000}
              />
              <p className="text-xs text-gray-400 mt-1">{content.length}/5000 (minimum 50)</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Important:</strong> Responses on this platform are general legal information, not legal advice, and do not create an attorney-client relationship. For specific legal advice tailored to your situation, please{' '}
                <Link href="/lawyers" className="underline">book a consultation</Link> with a lawyer.
              </p>
            </div>

            <div className="flex gap-4 justify-end">
              <Link
                href="/advice"
                className="btn-secondary py-3 px-6"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || content.length < 50}
                className="btn-primary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Posting…' : 'Post Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
