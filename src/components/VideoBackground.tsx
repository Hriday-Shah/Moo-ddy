import { useMemo, useState } from 'react'

type VideoBackgroundProps = {
  src: string
  poster?: string
  className?: string
}

export function VideoBackground({ src, poster, className }: VideoBackgroundProps) {
  const [failed, setFailed] = useState(false)

  const canShowVideo = useMemo(() => {
    if (failed) return false
    if (typeof window === 'undefined') return false
    return true
  }, [failed])

  return (
    <div className={className}>
      {canShowVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-[#66CCFF]" />
      )}

      <div className="absolute inset-0 bg-[#66CCFF]/25" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#66CCFF]/30 via-transparent to-white/15" />
    </div>
  )
}

