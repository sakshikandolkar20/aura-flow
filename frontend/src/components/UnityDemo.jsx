import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════════════════
   UNITY WEBGL DEMO COMPONENT
   ─ Lazily loads Unity only when the section scrolls
     into view (Intersection Observer).
   ─ Renders Unity canvas inside a styled glass container.
   ═══════════════════════════════════════════════════════ */

const UNITY_BUILD_PATH = '/unity/Build'
const UNITY_CONFIG = {
  dataUrl: `${UNITY_BUILD_PATH}/unity.data`,
  frameworkUrl: `${UNITY_BUILD_PATH}/unity.framework.js`,
  codeUrl: `${UNITY_BUILD_PATH}/unity.wasm`,
  streamingAssetsUrl: '/unity/StreamingAssets',
  companyName: 'DefaultCompany',
  productName: 'icu',
  productVersion: '0.1',
}

export default function UnityDemo() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const unityInstanceRef = useRef(null)
  const hasStartedLoading = useRef(false)

  const [status, setStatus] = useState('idle') // idle | loading | ready | error
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      if (unityInstanceRef.current) {
        unityInstanceRef.current.Quit().catch(() => {})
      }
    }
  }, [])

  /* ── Load Unity WebGL ── */
  const loadUnity = useCallback(() => {
    if (hasStartedLoading.current) return
    hasStartedLoading.current = true
    setStatus('loading')
    setProgress(0)

    // Dynamically inject the Unity loader script
    const script = document.createElement('script')
    script.src = `${UNITY_BUILD_PATH}/unity.loader.js`
    script.async = true

    script.onerror = () => {
      setStatus('error')
      setErrorMsg('Failed to load Unity loader script. Check that /unity/Build/unity.loader.js exists.')
    }

    script.onload = () => {
      if (typeof window.createUnityInstance !== 'function') {
        setStatus('error')
        setErrorMsg('createUnityInstance is not available. Unity loader may be corrupted.')
        return
      }

      const config = {
        ...UNITY_CONFIG,
        showBanner: (msg, type) => {
          if (type === 'error') {
            setStatus('error')
            setErrorMsg(msg)
          }
          // warnings are ignored to avoid UI clutter
        },
      }

      window
        .createUnityInstance(canvasRef.current, config, (p) => {
          setProgress(Math.round(p * 100))
        })
        .then((instance) => {
          unityInstanceRef.current = instance
          setStatus('ready')
        })
        .catch((err) => {
          setStatus('error')
          setErrorMsg(typeof err === 'string' ? err : err?.message || 'Unity failed to initialize.')
        })
    }

    document.body.appendChild(script)
  }, [])

  /* ── Intersection Observer — lazy load when visible ── */
  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadUnity()
          observer.disconnect()
        }
      },
      { rootMargin: '200px', threshold: 0.05 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [loadUnity])

  /* ── Fullscreen toggle ── */
  const handleFullscreen = () => {
    if (unityInstanceRef.current) {
      unityInstanceRef.current.SetFullscreen(1)
    }
  }

  /* ── Retry on error ── */
  const handleRetry = () => {
    hasStartedLoading.current = false
    setStatus('idle')
    setProgress(0)
    setErrorMsg('')
    // Remove old script so it re-loads fresh
    const oldScript = document.querySelector(`script[src="${UNITY_BUILD_PATH}/unity.loader.js"]`)
    if (oldScript) oldScript.remove()
    // re-trigger load
    loadUnity()
  }

  return (
    <div ref={containerRef} className="relative w-full" id="unity-demo-container">
      {/* ── Glass container ── */}
      <div className="glass-card glow-border rounded-2xl overflow-hidden relative">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            {/* Traffic-light dots */}
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            <span className="ml-3 text-xs text-slate-500 tracking-wider uppercase select-none">
              AuraFlow ICU — WebGL
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {status === 'ready' && (
              <motion.button
                onClick={handleFullscreen}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                title="Fullscreen"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </motion.button>
            )}

            {/* Status indicator */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
              status === 'ready'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : status === 'error'
                ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                : status === 'loading'
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                : 'bg-white/[0.06] text-slate-500 border border-white/[0.08]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                status === 'ready' ? 'bg-emerald-400' :
                status === 'error' ? 'bg-red-400' :
                status === 'loading' ? 'bg-sky-400 animate-pulse' :
                'bg-slate-500'
              }`} />
              {status === 'idle' && 'Waiting'}
              {status === 'loading' && 'Loading'}
              {status === 'ready' && 'Live'}
              {status === 'error' && 'Error'}
            </span>
          </div>
        </div>

        {/* ── Canvas area ── */}
        <div className="relative w-full" style={{ aspectRatio: '16 / 10' }}>
          <canvas
            ref={canvasRef}
            id="unity-canvas"
            tabIndex={-1}
            className="block w-full h-full bg-[#0a0a0a]"
            style={{
              // Ensure canvas fills the container
              width: '100%',
              height: '100%',
              outline: 'none',
            }}
          />

          {/* ── Loading overlay ── */}
          <AnimatePresence>
            {status === 'loading' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-sm z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.4 } }}
              >
                {/* Animated spinner */}
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-sky-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-teal-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>

                {/* Progress text */}
                <span className="text-2xl font-bold text-white mb-1">{progress}%</span>
                <span className="text-xs text-slate-500 tracking-widest uppercase mb-5">Loading Unity Engine</span>

                {/* Progress bar */}
                <div className="w-56 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Idle overlay ── */}
          <AnimatePresence>
            {status === 'idle' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/80 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 animate-pulse">
                  <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="text-sm text-slate-400">Scroll down to load the demo</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Error overlay ── */}
          <AnimatePresence>
            {status === 'error' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-sm z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-white mb-1">Failed to Load</span>
                <p className="text-xs text-slate-500 max-w-xs text-center mb-5 leading-relaxed px-4">
                  {errorMsg}
                </p>
                <motion.button
                  onClick={handleRetry}
                  className="px-5 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-sm text-white hover:bg-white/[0.1] transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Retry
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom accent ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />
      </div>

      {/* ── Helper text ── */}
      {status === 'ready' && (
        <motion.p
          className="text-center text-xs text-slate-600 mt-3 select-none"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Click inside the canvas to interact · Press F11 or use the button for fullscreen
        </motion.p>
      )}
    </div>
  )
}
