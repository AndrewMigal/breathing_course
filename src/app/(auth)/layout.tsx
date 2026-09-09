import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#0A1520' }}>
      {/* Hero image at top */}
      <Image
        src="/hero-banner.png"
        alt=""
        width={1920}
        height={1080}
        className="hidden md:block w-full h-auto"
        priority
      />

      {/* Form below */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-10 pt-6 md:justify-start">
        {children}
      </div>
    </main>
  )
}
