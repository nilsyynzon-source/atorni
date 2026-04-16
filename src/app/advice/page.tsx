import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdvicePost } from '@/types'
import { ADVICE_CATEGORIES } from '@/types'
import { timeAgo } from '@/lib/utils'
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
  const supabase = createClient()

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
    <div className="bg-zinc-50 min-h-screen">
      {/* Header */}
      <div className="bg-zinc-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-widest mb-3">Community Q&amp;A</p>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Free Legal Advice</h1>
              <p className="text-zinc-400 text-sm">
                Ask questions and get answers from real lawyers — completely free.
              </p>
            </div>
            <Link
              href="/advice/new"
              className="inline-flex items-center gap-2 bg-white text-zinc-950 font-medium px-5 py-3 rounded-lg hover:bg-zinc-100 transition-colors text-sm tracking-wide flex-shrink-0"
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
          <aside className="lg:w-48 flex-shrink-0">
            <div className="bg-white rounded-xl border border-zinc-200 p-5 sticky top-20">
              <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-4">Filter by Area</h2>
              <div className="space-y-0.5">
                <Link
                  href="/advice"
                  className={`block px-3 py-2 rounded-lg text-xs transition-colors ${
                    !searchParams.category
                      ? 'bg-zinc-950 text-white font-medium'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  All Areas
                </Link>
                {ADVICE_CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/advice?category=${encodeURIComponent(cat)}`}
                    className={`block px-3 py-2 rounded-lg text-xs transition-colors ${
                      searchParams.category === cat
                        ? 'bg-zinc-950 text-white font-medium'
                        : 'text-zinc-600 hover:bg-zinc-50'
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
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
              <p className="text-sm text-zinc-500">
                <strong className="text-zinc-950">{filtered.length}</strong> questions
                {searchParams.category && <span> in <strong>{searchParams.category}</strong></span>}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-zinc-200 p-16 text-center">
                <MessageSquare className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-zinc-950 mb-2">No questions yet</h3>
                <p className="text-zinc-500 text-sm mb-6">Be the first to ask a question in this area.</p>
                <Link href="/advice/new" className="btn-primary text-sm py-2.5 px-6">
                  Ask a Question
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(filtered as AdvicePost[]).map((post) => {
                  const answerCount =
                    Array.isArray(post.answers) && post.answers[0]
                      ? (post.answers[0] as { count: number }).count
                      : 0

                  return (
                    <Link
                      key={post.id}
                      href={`/advice/${post.id}`}
                      className="block bg-white rounded-xl border border-zinc-200 hover:border-zinc-400 p-6 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Answer count badge */}
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-center ${
                            post.is_answered
                              ? 'bg-zinc-950 text-white'
                              : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          <span className="text-base font-semibold">{answerCount}</span>
                          <span className="text-xs leading-none">
                            {answerCount === 1 ? 'ans.' : 'ans.'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {post.category && (
                              <span className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-md font-medium">
                                {post.category}
                              </span>
                            )}
                            {post.is_answered && (
                              <span className="flex items-center gap-1 text-xs bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-md font-medium">
                                <CheckCircle className="w-3 h-3" />
                                Answered
                              </span>
                            )}
                          </div>
                          <h3 className="font-medium text-zinc-950 text-sm mb-1">{post.title}</h3>
                          <p className="text-zinc-500 text-xs line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400">
                            <span>
                              by{' '}
                              <strong className="text-zinc-600">
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
