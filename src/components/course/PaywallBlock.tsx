'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/providers/ThemeProvider'
import { mockPurchase, signOut } from '@/app/(course)/course/actions'

const FEATURES = [
  '10 in-depth video lessons across 3 modules',
  'Foundations, core techniques & advanced practices',
  'Box breathing, 4-7-8, Wim Hof, coherent breathing',
  'Progress tracking — mark lessons as complete',
  'Lifetime access, learn at your own pace',
]

export default function PaywallBlock({ userEmail }: { userEmail: string }) {
  const { theme, toggle: toggleTheme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logoSrc = '/logo.png'

  async function handleSignOut() {
    await signOut()
    router.push('/login')
    router.refresh()
  }

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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header
        className="flex items-center gap-3 px-5 h-13 flex-shrink-0"
        style={{ background: 'var(--hdr)', borderBottom: '1px solid var(--hdr-2)' }}
      >
        <div className="w-7 h-7 rounded-full bg-white flex-shrink-0 flex items-center justify-center overflow-hidden">
          <Image src={logoSrc} alt="onlybreaths" width={26} height={26} className="object-contain" />
        </div>
        <span className="font-semibold text-sm flex-1 tracking-wide" style={{ color: '#E5F0F5' }}>
          onlybreaths
        </span>
        <span className="text-xs hidden sm:block" style={{ color: 'var(--text-3)' }}>
          {userEmail}
        </span>
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="p-1.5 rounded-lg" style={{ color: 'var(--text-3)' }}>
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        {/* Sign out */}
        <button onClick={handleSignOut} className="p-1.5 rounded-lg" style={{ color: 'var(--text-3)' }} aria-label="Sign out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Hero card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl mb-6"
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Hero banner */}
          <div className="relative h-48">
            <Image
              src="/hero-banner.png"
              alt="onlybreaths"
              fill
              className="object-cover object-center"
              sizes="512px"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(15,28,37,.85) 0%, rgba(15,28,37,.2) 60%, transparent 100%)' }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h1 className="text-2xl font-bold text-white">Breathwork Mastery</h1>
              <p className="text-sm mt-0.5 tracking-widest font-light" style={{ color: 'rgba(255,255,255,0.6)' }}>
                BREATHE · MOVE · LIVE
              </p>
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
                disabled
                className="w-full py-3 rounded-xl font-semibold text-sm opacity-40 cursor-not-allowed"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              >
                Get Instant Access
              </button>

              <p className="text-center text-xs mt-3" style={{ color: 'var(--text-3)' }}>
                Payment coming soon
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
    </div>
  )
}
