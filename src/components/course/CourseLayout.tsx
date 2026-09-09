'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/components/providers/ThemeProvider'
import { markLessonComplete, signOut } from '@/app/(course)/course/actions'
import type { LessonWithProgress } from '@/types/database'

interface Props {
  lessons: LessonWithProgress[]
  userEmail: string
  displayName: string
  isAdmin: boolean
}

// Group lessons by module
function groupByModule(lessons: LessonWithProgress[]) {
  const map = new Map<number, { name: string; lessons: LessonWithProgress[] }>()
  for (const lesson of lessons) {
    if (!map.has(lesson.module_id)) {
      map.set(lesson.module_id, { name: lesson.module_name, lessons: [] })
    }
    map.get(lesson.module_id)!.lessons.push(lesson)
  }
  return Array.from(map.entries()).map(([id, val]) => ({ id, ...val }))
}

export default function CourseLayout({ lessons, displayName, isAdmin }: Props) {
  const { theme, toggle: toggleTheme } = useTheme()
  const router = useRouter()

  const [currentLessonId, setCurrentLessonId] = useState<string>(lessons[0]?.id ?? '')
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(lessons.filter((l) => l.is_completed).map((l) => l.id))
  )
  const [openModules, setOpenModules] = useState<Set<number>>(
    () => new Set([lessons[0]?.module_id ?? 1])
  )
  const [activeTab, setActiveTab] = useState<'description' | 'materials' | 'comments'>('description')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [optimisticPending, setOptimisticPending] = useState(false)

  const modules = groupByModule(lessons)
  const currentLesson = lessons.find((l) => l.id === currentLessonId) ?? lessons[0]
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
  const isCompleted = completedIds.has(currentLessonId)
  const progressPct = lessons.length > 0
    ? Math.round((completedIds.size / lessons.length) * 100)
    : 0

  function selectLesson(id: string) {
    setCurrentLessonId(id)
    setActiveTab('description')
    setSidebarOpen(false)
    // open the module containing this lesson
    const lesson = lessons.find((l) => l.id === id)
    if (lesson) {
      setOpenModules((prev) => new Set([...prev, lesson.module_id]))
    }
  }

  function toggleModule(moduleId: number) {
    setOpenModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  const handleMarkComplete = useCallback(async () => {
    if (optimisticPending) return
    const newState = !isCompleted
    // Optimistic update
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (newState) next.add(currentLessonId)
      else next.delete(currentLessonId)
      return next
    })
    setOptimisticPending(true)
    try {
      await markLessonComplete(currentLessonId, newState)
    } catch {
      // Rollback
      setCompletedIds((prev) => {
        const next = new Set(prev)
        if (newState) next.delete(currentLessonId)
        else next.add(currentLessonId)
        return next
      })
    } finally {
      setOptimisticPending(false)
    }
  }, [currentLessonId, isCompleted, optimisticPending])

  async function handleSignOut() {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  const logoSrc = '/logo.png'

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 h-14 z-30"
              style={{ background: 'var(--hdr)', borderBottom: '1px solid var(--hdr-2)' }}>
        {/* Mobile sidebar toggle */}
        <button
          className="lg:hidden p-1.5 rounded-lg"
          style={{ color: 'var(--text-3)' }}
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-7 h-7 rounded-full bg-white flex-shrink-0 flex items-center justify-center overflow-hidden">
            <Image src={logoSrc} alt="onlybreaths" width={28} height={28} className="object-contain" />
          </div>
          <span className="font-semibold text-sm hidden sm:block tracking-wide" style={{ color: '#E5F0F5' }}>
            onlybreaths
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex-1 max-w-xs hidden md:block">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--hdr-2)' }}>
              <div
                className="h-full rounded-full progress-bar"
                style={{ width: `${progressPct}%`, background: 'var(--sky)' }}
              />
            </div>
            <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-3)' }}>
              {progressPct}%
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs hidden sm:block" style={{ color: 'var(--text-3)' }}>{displayName}</span>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-3)' }}
            aria-label="Toggle theme"
          >
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

          {/* Admin link */}
          {isAdmin && (
            <a
              href="/admin"
              className="text-xs px-2.5 py-1 rounded-lg transition-colors"
              style={{ color: 'var(--sky)', border: '1px solid var(--sky-b)' }}
            >
              Admin
            </a>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-3)' }}
            aria-label="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 lg:hidden"
            style={{ background: 'rgba(0,0,0,.5)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-20
            flex flex-col w-72 flex-shrink-0 overflow-y-auto
            transition-transform duration-300 lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ background: 'var(--bg-md)', borderRight: '1px solid var(--border)', paddingTop: '3.5rem' }}
        >
          {/* Hero banner */}
          <div className="relative mx-4 mt-4 mb-2 rounded-xl overflow-hidden" style={{ height: '160px' }}>
            <Image
              src="/hero-banner.png"
              alt="onlybreaths"
              fill
              className="object-cover object-center"
              sizes="272px"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(15,28,37,.85) 0%, rgba(15,28,37,.2) 60%, transparent 100%)' }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-xs font-semibold text-white leading-tight tracking-wide">Breathwork Mastery</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}>
                BREATHE · MOVE · LIVE
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {lessons.length} lessons
              </p>
            </div>
          </div>

          {/* Progress (mobile) */}
          <div className="mx-4 mb-4 md:hidden">
            <div className="flex items-center justify-between text-xs mb-1"
                 style={{ color: 'var(--text-3)' }}>
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-dk)' }}>
              <div
                className="h-full rounded-full progress-bar"
                style={{ width: `${progressPct}%`, background: 'var(--sky)' }}
              />
            </div>
          </div>

          {/* Module list */}
          <nav className="flex-1 px-2 pb-4">
            {modules.map((mod) => {
              const isOpen = openModules.has(mod.id)
              const modCompleted = mod.lessons.filter((l) => completedIds.has(l.id)).length
              return (
                <div key={mod.id} className="mb-1">
                  {/* Module header */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors"
                    style={{ background: isOpen ? 'var(--acc-t)' : 'transparent' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider truncate"
                         style={{ color: 'var(--accent)' }}>
                        Module {mod.id}
                      </p>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                        {mod.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                        {modCompleted}/{mod.lessons.length}
                      </span>
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        style={{
                          color: 'var(--text-3)',
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </button>

                  {/* Lesson list */}
                  {isOpen && (
                    <div className="pl-1 mt-0.5 space-y-0.5">
                      {mod.lessons.map((lesson) => {
                        const isCurrent = lesson.id === currentLessonId
                        const isDone = completedIds.has(lesson.id)
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => selectLesson(lesson.id)}
                            className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-colors"
                            style={{
                              background: isCurrent ? 'var(--sky-t)' : 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = 'var(--acc-h)'
                            }}
                            onMouseLeave={(e) => {
                              if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                            }}
                          >
                            {/* Status icon */}
                            <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{
                                    background: isDone ? 'var(--sky)' : isCurrent ? 'var(--sky-t)' : 'var(--bg-dk)',
                                    border: isDone ? 'none' : `1.5px solid ${isCurrent ? 'var(--sky)' : 'var(--border)'}`,
                                  }}>
                              {isDone && (
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              )}
                            </span>
                            <span
                              className="text-xs leading-snug"
                              style={{
                                color: isCurrent ? 'var(--sky-d)' : isDone ? 'var(--text-3)' : 'var(--text-2)',
                                fontWeight: isCurrent ? '600' : '400',
                              }}
                            >
                              {lesson.order_index}. {lesson.title}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </aside>

        {/* ── Main content ────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">

            {/* Video player */}
            {currentLesson && (
              <div key={currentLesson.id} className="lesson-fade">
                <div className="relative rounded-2xl overflow-hidden shadow-xl mb-5"
                     style={{ paddingBottom: '56.25%', background: '#000' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${currentLesson.youtube_id}?rel=0&modestbranding=1`}
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>

                {/* Lesson header + controls */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                       style={{ color: 'var(--accent)' }}>
                      {currentLesson.module_name} · Lesson {currentLesson.order_index}
                    </p>
                    <h1 className="text-xl font-bold leading-snug" style={{ color: 'var(--text)' }}>
                      {currentLesson.title}
                    </h1>
                  </div>

                  {/* Mark complete button */}
                  <button
                    onClick={handleMarkComplete}
                    disabled={optimisticPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex-shrink-0"
                    style={{
                      background: isCompleted ? 'var(--sky-t)' : 'var(--sky)',
                      border: isCompleted ? '1.5px solid var(--sky-b)' : 'none',
                      color: isCompleted ? 'var(--sky-d)' : 'white',
                    }}
                  >
                    {isCompleted ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Completed
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
                        </svg>
                        Mark Complete
                      </>
                    )}
                  </button>
                </div>

                {/* Prev / Next navigation */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => prevLesson && selectLesson(prevLesson.id)}
                    disabled={!prevLesson}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-30"
                    style={{
                      background: 'var(--bg-md)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-2)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={() => nextLesson && selectLesson(nextLesson.id)}
                    disabled={!nextLesson}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-30"
                    style={{
                      background: 'var(--bg-md)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-2)',
                    }}
                  >
                    Next
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>

                {/* Tabs */}
                <div className="border-b mb-5" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex gap-1">
                    {(['description', 'materials', 'comments'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px"
                        style={{
                          borderColor: activeTab === tab ? 'var(--sky)' : 'transparent',
                          color: activeTab === tab ? 'var(--sky-d)' : 'var(--text-3)',
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab content */}
                {activeTab === 'description' && (
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                      {currentLesson.description}
                    </p>
                    {currentLesson.objectives && currentLesson.objectives.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
                          Learning Objectives
                        </h3>
                        <ul className="space-y-1.5">
                          {currentLesson.objectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm"
                                style={{ color: 'var(--text-2)' }}>
                              <span className="mt-1 w-4 h-4 flex-shrink-0 rounded-full flex items-center justify-center"
                                    style={{ background: 'var(--sky-t)', border: '1px solid var(--sky-b)' }}>
                                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                                     style={{ color: 'var(--sky-d)' }}>
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </span>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="rounded-xl p-5 text-center"
                       style={{ background: 'var(--bg-md)', border: '1px solid var(--border)' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.5" className="mx-auto mb-3" style={{ color: 'var(--text-3)' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                      No materials for this lesson yet.
                    </p>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="rounded-xl p-5 text-center"
                       style={{ background: 'var(--bg-md)', border: '1px solid var(--border)' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.5" className="mx-auto mb-3" style={{ color: 'var(--text-3)' }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                      Comments coming soon.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
