'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTheme } from '@/components/providers/ThemeProvider'
import { mockPurchase } from '@/app/(course)/course/actions'

const FEATURES = [
  '10 in-depth video lessons across 3 modules',
  'Foundations, core techniques & advanced practices',
  'Box breathing, 4-7-8, Wim Hof, coherent breathing',
  'Progress tracking — mark lessons as complete',
  'Lifetime access, learn at your own pace',
]

export default function PaywallBlock() {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logoSrc = theme === 'dark' ? '/logo-dark.jpg' : '/logo-light.jpg'

  async function handleBuy() {
    setLoading(true)
    setError(null)
    try {
      await mockPurchase()
      // revalidatePath in the action will cause the Server Component to re-render
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-lg">

        {/* Hero card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl mb-6"
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Logo banner */}
          <div className="relative h-48" style={{ background: 'var(--bg-dk)' }}>
            <Image
              src={logoSrc}
              alt="Breathwork Mastery"
              fill
              className="object-cover"
              sizes="512px"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 50%)' }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex gap-0.5 mb-1.5">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#F5A623">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
                <span className="text-xs text-white/70 ml-1">5.0</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Breathwork Mastery</h1>
              <p className="text-sm text-white/70">Inhale Exhale Co.</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6" style={{ background: 'var(--bg-md)' }}>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-2)' }}>
              Master the science and art of conscious breathing. This complete course takes you from
              the fundamentals of breath anatomy to advanced techniques used by elite athletes,
              Navy SEALs, and meditation masters.
            </p>

            {/* Feature list */}
            <ul className="space-y-2.5 mb-6">
              {FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-2)' }}>
                  <span
                    className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--sky-t)', border: '1px solid var(--sky-b)' }}
                  >
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="3" style={{ color: 'var(--sky-d)' }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  {feat}
                </li>
              ))}
            </ul>

            {/* Price + CTA */}
            <div
              className="rounded-2xl p-5"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-bold" style={{ color: 'var(--text)' }}>$97</span>
                <span className="text-sm pb-1 line-through" style={{ color: 'var(--text-3)' }}>$197</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full mb-1"
                  style={{ background: 'var(--sky-t)', color: 'var(--sky-d)' }}
                >
                  51% OFF
                </span>
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>
                One-time payment · Lifetime access
              </p>

              {error && (
                <p className="text-xs px-3 py-2 rounded-lg mb-3"
                   style={{ background: 'rgba(220,50,50,.12)', color: '#e05555' }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleBuy}
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-60"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              >
                {loading ? 'Processing...' : 'Get Instant Access'}
              </button>

              <p className="text-center text-xs mt-3" style={{ color: 'var(--text-3)' }}>
                🧪 Demo mode — no real payment required
              </p>
            </div>
          </div>
        </div>

        {/* Already logged in note */}
        <p className="text-center text-xs" style={{ color: 'var(--text-3)' }}>
          You&apos;re signed in. Click the button above to unlock the course.
        </p>
      </div>
    </div>
  )
}
