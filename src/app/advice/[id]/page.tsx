import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdvicePost, AdviceAnswer } from '@/types'
import { formatDateTime, getInitials, timeAgo } from '@/lib/utils'
import { ArrowLeft, CheckCircle, MessageSquare, Scale, ThumbsUp } from 'lucide-react'
import AnswerForm from './AnswerForm'

export default async function AdvicePostPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Note: view count increment handled server-side via DB trigger or future RPC

  const { data: post } = await supabase
    .from('advice_posts')
    .select('*, author:profiles(*)')
    .eq('id', params.id)
    .single()

  if (!post) notFound()

  const { data: answers } = await supabase
    .from('advice_answers')
    .select('*, author:profiles(*), lawyer_profile:lawyer_profiles(id, is_verified, specializations)')
    .eq('post_id', params.id)
    .order('is_accepted', { ascending: false })
    .order('upvotes', { ascending: false })
    .order('created_at', { ascending: true })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthor = user?.id === post.author_id

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/advice"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Q&A
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Question */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {post.category && (
              <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                {post.category}
              </span>
            )}
            {post.is_answered && (
              <span className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Answered
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{post.content}</p>

          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-semibold text-xs">
                {getInitials(post.author?.full_name)}
              </div>
              <span className="text-sm text-gray-600">
                {post.author?.full_name || 'Anonymous'}
              </span>
            </div>
            <span className="text-sm text-gray-400">{timeAgo(post.created_at)}</span>
            <span className="text-sm text-gray-400 ml-auto">
              {formatDateTime(post.created_at)}
            </span>
          </div>
        </div>

        {/* Answers */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              {answers?.length ?? 0} {(answers?.length ?? 0) === 1 ? 'Answer' : 'Answers'}
            </h2>
          </div>

          {(!answers || answers.length === 0) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No answers yet. Be the first to help!</p>
            </div>
          )}

          <div className="space-y-4">
            {(answers as AdviceAnswer[] | null)?.map((answer) => {
              const isLawyer =
                answer.author?.role === 'lawyer'
              const authorName = answer.author?.full_name || 'Anonymous'

              return (
                <div
                  key={answer.id}
                  className={`bg-white rounded-2xl border shadow-sm p-6 ${
                    answer.is_accepted ? 'border-green-200' : 'border-gray-100'
                  }`}
                >
                  {answer.is_accepted && (
                    <div className="flex items-center gap-2 text-green-700 text-sm font-semibold mb-4">
                      <CheckCircle className="w-4 h-4" />
                      Accepted Answer
                    </div>
                  )}

                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{answer.content}</p>

                  <div className="flex items-center gap-4 mt-5 pt-5 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-semibold text-xs">
                        {getInitials(authorName)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{authorName}</span>
                        {isLawyer && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            <Scale className="w-3 h-3" />
                            Lawyer
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {answer.upvotes}
                    </div>
                    <span className="text-sm text-gray-400 ml-auto">{timeAgo(answer.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Answer form */}
        {user ? (
          <AnswerForm postId={post.id} isAuthor={isAuthor} />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-600 mb-4">
              <Link href="/auth/login" className="text-blue-700 font-medium hover:underline">
                Sign in
              </Link>{' '}
              to answer this question.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
