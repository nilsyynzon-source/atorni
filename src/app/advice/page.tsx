import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdvicePost } from '@/types'
import { ADVICE_CATEGORIES } from '@/types'
import { formatDate, timeAgo } from '@/lib/utils'
import { MessageSquare, CheckCircle, Eye, Plus, Search } from 'lucide-react'

interface SearchParams {
  category?: string
  q?: string
}

export default async function AdvicePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  let query = supabase
    .from('advice_posts')
    .select('*, author:profiles(*), answers:advice_answers(count)')
    .order('created_at', { ascending: false })

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  const { data: posts } = await query.limit(50)

  const filtered = searchParams.q
    ? (posts || []).filter(
        (p) =>
          p.title.toLowerCase().includes(searchParams.q!.toLowerCase()) ||
          p.content.toLowerCase().includes(searchParams.q!.toLowerCase())
      )
    : posts || []

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Free Legal Advice</h1>
              <p className="text-blue-200">
                Ask questions and get answers from real lawyers — completely free.
              </p>
            </div>
            <Link
              href="/advice/new"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-blue-900 font-semibold px-5 py-3 rounded-xl transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              Ask a Question
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <h2 className="font-semibold text-gray-900 mb-4">Filter by Area</h2>
              <div className="space-y-1">
                <Link
                  href="/advice"
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    !searchParams.category
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Areas
                </Link>
                {ADVICE_CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/advice?category=${encodeURIComponent(cat)}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      searchParams.category === cat
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Search */}
            <form method="GET" className="mb-5">
              {searchParams.category && (
                <input type="hidden" name="category" value={searchParams.category} />
              )}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="q"
                  type="text"
                  defaultValue={searchParams.q}
                  className="input pl-10"
                  placeholder="Search questions..."
                />
              </div>
            </form>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                <strong className="text-gray-900">{filtered.length}</strong> questions
                {searchParams.category && <span> in <strong>{searchParams.category}</strong></span>}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions yet</h3>
                <p className="text-gray-500 text-sm mb-6">Be the first to ask a question in this area.</p>
                <Link href="/advice/new" className="btn-primary text-sm py-2.5 px-6">
                  Ask a Question
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {(filtered as AdvicePost[]).map((post) => {
                  const answerCount =
                    Array.isArray(post.answers) && post.answers[0]
                      ? (post.answers[0] as { count: number }).count
                      : 0

                  return (
                    <Link
                      key={post.id}
                      href={`/advice/${post.id}`}
                      className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {/* Answer count badge */}
                        <div
                          className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center ${
                            post.is_answered
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          <span className="text-xl font-bold">{answerCount}</span>
                          <span className="text-xs">
                            {answerCount === 1 ? 'answer' : 'answers'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {post.category && (
                              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                                {post.category}
                              </span>
                            )}
                            {post.is_answered && (
                              <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
                                <CheckCircle className="w-3 h-3" />
                                Answered
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-700 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-gray-500 text-sm line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <span>
                              by{' '}
                              <strong className="text-gray-600">
                                {post.author?.full_name || 'Anonymous'}
                              </strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.view_count}
                            </span>
                            <span>{timeAgo(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
