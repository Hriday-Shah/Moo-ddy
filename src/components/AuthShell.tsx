import { type ReactNode } from 'react'

export function AuthShell({
  children,
}: {
  children: ReactNode
}) {
  const milkCandidates = [
    '/milk-carton.png',
    '/milk%20carton.png',
    '/Milk%20Carton.png',
    '/milk%20carton.PNG',
    '/Milk%20Carton.PNG',
  ]
  const butterCandidates = [
    '/butter.png',
    '/Butter.png',
    '/butter.PNG',
    '/Butter.PNG',
  ]

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#66CCFF] text-zinc-50">
      <img
        src={milkCandidates[0]}
        alt="Milk carton"
        className="pointer-events-none fixed bottom-[-120px] left-[-70px] hidden h-[420px] w-auto rotate-45 lg:block"
        data-idx="0"
        onError={(e) => {
          const img = e.currentTarget
          const idx = Number(img.dataset.idx ?? '0')
          const next = idx + 1
          if (next < milkCandidates.length) {
            img.dataset.idx = String(next)
            img.src = milkCandidates[next]
            return
          }
          img.style.display = 'none'
        }}
      />

      <img
        src={butterCandidates[0]}
        alt="Butter"
        className="pointer-events-none fixed bottom-[-50px] right-[-20px] hidden h-[280px] w-auto lg:block"
        data-idx="0"
        onError={(e) => {
          const img = e.currentTarget
          const idx = Number(img.dataset.idx ?? '0')
          const next = idx + 1
          if (next < butterCandidates.length) {
            img.dataset.idx = String(next)
            img.src = butterCandidates[next]
            return
          }
          img.style.display = 'none'
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pb-10 pt-8">
        <div className="relative">
          <img
            src="/logo%20of%20mooo-dy.png"
            alt="mooo-dy"
            className="absolute left-0 top-[-24px] h-40 w-auto rounded-md bg-white/30 p-2.5 shadow-sm shadow-black/20"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />

          <div className="text-center">
            <div className="text-4xl font-black tracking-tight text-zinc-950">
              At Mooo-dy,
            </div>
            <div className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-950">
              there is every mood&apos;s dairy.
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center pt-8">
          <div className="w-full max-w-md rounded-3xl border border-sky-200/80 bg-zinc-950/45 p-6 shadow-2xl shadow-sky-950/30 backdrop-blur-xl sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

