import { useEffect, useState } from 'react'

const SLOGANS = [
  'Preparando os temperos...',
  'Buscando os melhores ingredientes...',
  'Aquecendo o tucupi...',
  'Colhendo o jambu fresquinho...',
  'Amassando o açaí...',
  'Coando a farinha d\'água...',
]

interface SplashScreenProps {
  onDone: () => void
}

function SplashScreen({ onDone }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)
  const [sloganIndex, setSloganIndex] = useState(0)

  useEffect(() => {
    const sloganInterval = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % SLOGANS.length)
    }, 800)

    const timer = setTimeout(() => {
      clearInterval(sloganInterval)
      setFadeOut(true)
      setTimeout(onDone, 500)
    }, 2500)

    return () => {
      clearTimeout(timer)
      clearInterval(sloganInterval)
    }
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#0a2e1d',
        backgroundImage: 'radial-gradient(rgba(74, 222, 128, 0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(74,222,128,0.4) 0%, transparent 70%)',
        }}
      />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(15,81,50,0.6) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl mb-6
          animate-[saborAppear_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <img
            src="/logo.png"
            alt="SaborExpress"
            className="w-28 h-28 object-contain"
          />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2
            animate-[saborSlideUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.2s_forwards] opacity-0">
            SaborExpress
          </h1>
          <p className="text-emerald-300/70 text-sm font-medium
            animate-[saborSlideUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.4s_forwards] opacity-0">
            {SLOGANS[sloganIndex]}
          </p>
        </div>

        {/* Loading bar */}
        <div className="relative z-10 mt-10 w-48 h-1 rounded-full overflow-hidden
          animate-[saborSlideUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.6s_forwards] opacity-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: '100%',
              backgroundColor: '#4ade80',
              animation: 'saborLoading 2s cubic-bezier(0.16,1,0.3,1) forwards',
              transformOrigin: 'left',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes saborAppear {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes saborSlideUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes saborLoading {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}

export default SplashScreen
