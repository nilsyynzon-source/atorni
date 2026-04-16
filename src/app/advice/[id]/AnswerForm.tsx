'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface AnswerFormProps {
  postId: string
  isAuthor: boolean
}

export default function AnswerForm({ postId }: AnswerFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim().length < 20) {
      toast.error('Answer must be at least 20 characters')
      return
    }
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('advice_answers').insert({
      post_id: postId,
      author_id: user.id,
      content: content.trim(),
    })

    if (error) {
      toast.error('Failed to post answer. Please try again.')
      setLoading(false)
      return
    }

    toast.success('Answer posted!')
    setContent('')
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-8">
      <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-5">Your Answer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input resize-none"
          rows={6}
          placeholder="Share your knowledge or experience. Be specific and helpful. Mention relevant laws or legal principles if applicable."
          required
          minLength={20}
          maxLength={5000}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-400">{content.length}/5000</p>
          <button
            type="submit"
            disabled={loading || content.trim().length < 20}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Posting…' : 'Post Answer'}
          </button>
        </div>
      </form>
    </div>
  )
}
