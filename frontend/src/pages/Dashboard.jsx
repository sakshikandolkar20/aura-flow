import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CO2TrendChart, PredictionAreaChart, ParameterImpactChart } from '../components/Charts'

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  (import.meta.env.PROD ? '' : 'http://127.0.0.1:5000')
const API_URL = `${API_BASE_URL}/predict`

/* ─── Helpers ─── */
const statusMeta = {
  Optimal: {
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
    ringColor: '#22c55e',
    suggestion: 'Air quality is excellent. Maintain current ventilation settings.',
    icon: '✓',
  },
  Acceptable: {
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    glow: 'shadow-amber-500/10',
    ringColor: '#f59e0b',
    suggestion: 'CO₂ is rising. Consider increasing ventilation rate or reducing room occupancy.',
    icon: '⚠',
  },
  High: {
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    glow: 'shadow-red-500/10',
    ringColor: '#ef4444',
    suggestion: 'Immediate action required! Open additional ventilation, reduce occupancy, and alert the clinical team.',
    icon: '✕',
  },
}

const fields = [
  { key: 'time_min', label: 'Time (min)', placeholder: 'e.g. 30', step: '1', icon: '⏱' },
  { key: 'occupancy', label: 'Occupancy', placeholder: 'e.g. 4', step: '1', icon: '👥' },
  { key: 'ventilation_efficiency', label: 'Ventilation Efficiency', placeholder: 'e.g. 0.85', step: '0.01', icon: '🌀' },
  { key: 'ventilation_rate', label: 'Ventilation Rate', placeholder: 'e.g. 6.0', step: '0.1', icon: '💨' },
  { key: 'temperature_c', label: 'Temperature (°C)', placeholder: 'e.g. 22.5', step: '0.1', icon: '🌡' },
  { key: 'humidity_pct', label: 'Humidity (%)', placeholder: 'e.g. 45', step: '0.1', icon: '💧' },
]

const initialForm = Object.fromEntries(fields.map((f) => [f.key, '']))

/* ─── Spinner SVG ─── */
const Spinner = ({ className = 'h-5 w-5' }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

/* ─── Animation Variants ─── */
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0, scale: 0.95, y: -10,
    transition: { duration: 0.3 },
  },
}

/* ═══════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [predictionHistory, setPredictionHistory] = useState([])

  const handleChange = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    // Build numeric payload
    const payload = {}
    for (const f of fields) {
      const v = parseFloat(form[f.key])
      if (isNaN(v)) {
        setError(`"${f.label}" must be a valid number.`)
        setLoading(false)
        console.error(`[AuraFlow] Validation error: ${f.label} is not a valid number`)
        return
      }
      payload[f.key] = v
    }

    console.log('[AuraFlow] Sending prediction request:', payload)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        const errMsg = body?.error || `Server responded with ${res.status}`
        console.error('[AuraFlow] API error:', errMsg)
        throw new Error(errMsg)
      }

      const data = await res.json()
      console.log('[AuraFlow] Prediction result:', data)

      setResult(data)
      setPredictionHistory((prev) => [
        ...prev,
        { ...payload, predicted_co2: data.predicted_co2, status: data.status },
      ])
    } catch (err) {
      const errMsg = err.message || 'Failed to connect to the prediction server.'
      console.error('[AuraFlow] Request failed:', errMsg)
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }, [form])

  const meta = result ? statusMeta[result.status] || statusMeta.Acceptable : null

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* ── Ambient glow ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/3 w-[700px] h-[700px] rounded-full bg-sky-600/12 blur-[180px] animate-glow-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-teal-500/8 blur-[140px] animate-glow-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-12 py-4">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group"
            whileHover={{ x: -3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
          <span className="text-lg font-bold tracking-tight glow-text">
            AuraFlow
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500">Dashboard</span>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Prediction Dashboard
          </h1>
          <p className="mt-2 text-slate-400">
            Enter ICU room parameters to forecast CO₂ concentration in real-time.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* ═══ LEFT: Form (2 cols) ═══ */}
          <motion.div
            className="lg:col-span-2 glass-card glow-border p-6 sm:p-8 rounded-2xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Predict CO₂</h2>
                <p className="text-xs text-slate-500">ICU environmental parameters</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((f, idx) => (
                <motion.label
                  key={f.key}
                  className="block"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + idx * 0.05 }}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1.5">
                    <span className="text-base">{f.icon}</span>
                    {f.label}
                  </span>
                  <input
                    type="number"
                    step={f.step}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    required
                    className="aura-input"
                  />
                </motion.label>
              ))}

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full aura-btn-primary !rounded-xl !py-3.5 mt-2"
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Analyzing…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Predict CO₂
                  </span>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* ═══ RIGHT: Result (3 cols) ═══ */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              {/* Empty state */}
              {!result && !loading && !error && (
                <motion.div
                  key="empty"
                  className="glass-card glow-border rounded-2xl p-10 sm:p-12 text-center"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.div
                    className="text-6xl mb-6 opacity-30"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    🫁
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Awaiting Analysis
                  </h3>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">
                    Enter ICU parameters and click{' '}
                    <span className="text-sky-400 font-medium">Predict CO₂</span> to
                    generate an AI-powered air quality forecast.
                  </p>
                </motion.div>
              )}

              {/* Loading state */}
              {loading && (
                <motion.div
                  key="loading"
                  className="glass-card glow-border rounded-2xl p-10 sm:p-12 text-center"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Spinner className="mx-auto h-12 w-12 text-sky-400" />
                  <p className="mt-6 text-slate-400 text-sm">Running ML prediction model…</p>
                  <div className="mt-4 w-48 h-1 mx-auto rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-sky-500 to-teal-400 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Error state */}
              {error && !loading && (
                <motion.div
                  key="error"
                  className="bg-red-500/[0.08] backdrop-blur-md border border-red-500/20 rounded-2xl p-8 text-center"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <span className="text-red-400 text-xl">✕</span>
                  </div>
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Prediction Failed</h3>
                  <p className="text-sm text-red-300/80 max-w-md mx-auto">{error}</p>
                  <p className="text-xs text-slate-500 mt-3">
                    Ensure the Flask backend is running at <code className="text-sky-400/80">127.0.0.1:5000</code>
                  </p>
                </motion.div>
              )}

              {/* Result card */}
              {result && !loading && (
                <motion.div
                  key="result"
                  className={`glass-card glow-border rounded-2xl p-8 shadow-xl ${meta?.glow}`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Prediction Result
                    </h3>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Analysis
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                    {/* CO₂ Value */}
                    <div className="text-center">
                      <motion.p
                        className="text-7xl font-extrabold tracking-tight text-white"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                      >
                        {Number(result.predicted_co2).toFixed(1)}
                      </motion.p>
                      <p className="mt-1 text-sm text-slate-400">ppm CO₂</p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-center gap-3">
                      <motion.span
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold border ${meta?.color}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
                      >
                        {meta?.icon} {result.status}
                      </motion.span>

                      {/* Visual gauge */}
                      <div className="w-48 h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, #22c55e, ${meta?.ringColor})`,
                          }}
                          initial={{ width: '0%' }}
                          animate={{
                            width: `${Math.min((result.predicted_co2 / 1200) * 100, 100)}%`,
                          }}
                          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 tracking-wider uppercase">
                        0 ─────── 600 ─────── 1200 ppm
                      </p>
                    </div>
                  </div>

                  {/* Suggestion */}
                  <motion.div
                    className="bg-white/[0.03] rounded-xl p-5 border border-white/[0.06]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recommended Action
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {meta?.suggestion}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ Charts Section ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-sky-400 to-teal-400" />
                <h2 className="text-lg font-bold text-white">Analytics</h2>
                <span className="text-xs text-slate-500 ml-1">
                  {predictionHistory.length > 0
                    ? `${predictionHistory.length} prediction${predictionHistory.length > 1 ? 's' : ''} recorded`
                    : 'Demo data shown'}
                </span>
              </div>
              <div className="grid gap-6">
                <CO2TrendChart predictionHistory={predictionHistory} />
                <PredictionAreaChart predictionHistory={predictionHistory} />
                <ParameterImpactChart formData={result ? form : null} />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.04] py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} AuraFlow · AI-Powered ICU Air Quality Monitoring
      </footer>
    </div>
  )
}
