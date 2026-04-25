import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import icuBg from '../assets/icu-hero-bg.png'

/* ─── Lazy-load 3D canvas for performance ─── */
const HeroCanvas = lazy(() => import('./HeroCanvas'))

/* ─── Smooth scroll helper ─── */
const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ─── Animation variants ─── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const metrics = [
  ['< 1 s', 'Prediction speed'],
  ['6', 'Input variables'],
  ['3', 'Risk levels'],
  ['99.2%', 'Accuracy'],
]

export default function Hero3D() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ── Background Image Layer ── */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src={icuBg}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
        </motion.div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0a0f1e]/80 backdrop-blur-sm" />
      </div>

      {/* ── Ambient Glow Orbs ── */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-sky-600/20 blur-[180px] animate-glow-pulse" />
        <div className="absolute top-[60%] -left-[15%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[140px] animate-glow-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] -right-[15%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[140px] animate-glow-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* ── 3D Canvas Layer ── */}
      <div className="absolute inset-0 z-[2]">
        <Suspense fallback={null}>
          <HeroCanvas />
        </Suspense>
      </div>

      {/* ── Foreground Content ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-2 mb-6 px-5 py-2 text-xs font-semibold tracking-[0.2em] uppercase rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20"
        >
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          ICU Air Quality Intelligence
        </motion.span>

        {/* Title */}
        <motion.h1
          variants={fadeUp}
          className="text-6xl sm:text-8xl font-extrabold leading-[0.95] tracking-tight"
        >
          <span className="glow-text">AuraFlow</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed"
        >
          Predict ICU air risk{' '}
          <span className="text-white font-medium">before</span> it becomes
          dangerous. ML-powered CO₂ forecasting for safer critical-care
          environments.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4">
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="aura-btn-primary group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Open Dashboard
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            {/* Glow effect */}
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-400 opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500" />
          </motion.button>

          {/* Explore Features — scrolls to #features */}
          <motion.button
            onClick={() => scrollToSection('features')}
            className="aura-btn-ghost"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Features
          </motion.button>
        </motion.div>

        {/* Metric Pills */}
        <motion.div
          variants={fadeUp}
          className="mt-16 flex flex-wrap justify-center gap-4"
        >
          {metrics.map(([val, label]) => (
            <motion.div
              key={label}
              className="glass-card flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm"
              whileHover={{ scale: 1.06, y: -2 }}
              transition={{ duration: 0.25 }}
            >
              <span className="font-bold text-sky-400">{val}</span>
              <span className="text-slate-400">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Scroll Indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        onClick={() => scrollToSection('problem')}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2 hover:border-sky-400/40 transition-colors duration-300">
          <div className="w-1 h-2.5 rounded-full bg-sky-400/60" />
        </div>
      </motion.div>
    </section>
  )
}
