import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef, useCallback } from 'react'
import Hero3D from '../components/Hero3D'

/* ═══════════════════════════════════
   SMOOTH SCROLL HELPER
   ═══════════════════════════════════ */
const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/* ═══════════════════════════════════
   SCROLL-ANIMATED SECTION WRAPPER
   — forwards id + all other props
   ═══════════════════════════════════ */
const ScrollSection = ({ children, className = '', id, ...rest }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...rest}
    >
      {children}
    </motion.section>
  )
}

/* ═══════════════════════════════════
   GLASS CARD — enhanced hover glow
   ═══════════════════════════════════ */
const GlassCard = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      className={`glass-card glow-border p-6 rounded-2xl group ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        scale: 1.03,
        y: -6,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════
   SECTION HEADING — animated
   ═══════════════════════════════════ */
const SectionHeading = ({ badge, title, subtitle }) => (
  <div className="text-center mb-14">
    {badge && (
      <motion.span
        className="inline-flex items-center gap-2 mb-5 px-5 py-2 text-xs font-semibold tracking-[0.2em] uppercase rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
        {badge}
      </motion.span>
    )}
    <motion.h2
      className="text-3xl sm:text-4xl font-bold text-white mb-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p
        className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {subtitle}
      </motion.p>
    )}
  </div>
)

/* ─── Data ─── */
const problems = [
  {
    icon: '🫁',
    title: 'Invisible Air Risk',
    desc: 'CO₂ builds up silently in sealed ICU rooms, putting vulnerable patients at risk without any visible warning signs.',
  },
  {
    icon: '⏳',
    title: 'Delayed Detection',
    desc: 'Traditional monitors react only after thresholds are breached — by then, patient comfort and safety may already be compromised.',
  },
  {
    icon: '📊',
    title: 'Data Blind Spots',
    desc: 'Hospitals track vitals but rarely correlate occupancy, ventilation, and environment data to forecast air quality issues.',
  },
]

const features = [
  { icon: '⚡', title: 'Real-Time Prediction', desc: 'Get instant CO₂ forecasts based on live environmental parameters.' },
  { icon: '🎯', title: 'Status Classification', desc: 'Automatic Optimal / Acceptable / High labelling with color-coded badges.' },
  { icon: '🔄', title: 'Multi-Variable Input', desc: 'Factors in occupancy, ventilation rate, temperature, humidity, and time.' },
  { icon: '🛡️', title: 'Actionable Alerts', desc: 'Receive clear next-step suggestions when CO₂ is trending high.' },
  { icon: '📈', title: 'Visual Analytics', desc: 'Interactive charts track predictions over time with trend analysis.' },
  { icon: '🔗', title: 'API-Driven', desc: 'Built on a Flask ML backend — easy to integrate into hospital systems.' },
]

const steps = [
  { num: '01', label: 'Enter Parameters', desc: 'Input real-time ICU environmental data' },
  { num: '02', label: 'ML Prediction', desc: 'AI models analyze multi-variable inputs' },
  { num: '03', label: 'Get Actionable Insight', desc: 'Receive status and recommendations' },
]

/* ═══════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate()

  const handleNavClick = useCallback((e, sectionId) => {
    e.preventDefault()
    scrollToSection(sectionId)
  }, [])

  return (
    <div className="relative min-h-screen bg-[#0a0f1e] text-white overflow-hidden">

      {/* ════════════════════════════════════════
          NAVBAR — fixed, glassmorphism, working links
         ════════════════════════════════════════ */}
      <motion.nav
        className="fixed top-0 inset-x-0 z-50 bg-[#0a0f1e]/60 backdrop-blur-2xl border-b border-white/[0.06]"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center justify-between px-6 sm:px-12 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <motion.span
            className="text-xl font-bold tracking-tight glow-text cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            AuraFlow
          </motion.span>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={(e) => handleNavClick(e, 'problem')}
              className="nav-link hidden md:block"
            >
              Why It Matters
            </button>
            <button
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="nav-link hidden sm:block"
            >
              How It Works
            </button>
            <button
              onClick={(e) => handleNavClick(e, 'features')}
              className="nav-link hidden sm:block"
            >
              Features
            </button>
            <button
              onClick={(e) => handleNavClick(e, 'demo')}
              className="nav-link hidden md:block"
            >
              Demo
            </button>

            {/* Dashboard CTA */}
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1.5 pl-4 border-l border-white/10"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
            >
              Dashboard
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ════════════════  HERO  ════════════════ */}
      <section id="hero">
        <Hero3D />
      </section>

      {/* ════════════════  PROBLEM  ════════════════ */}
      <ScrollSection id="problem" className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <SectionHeading
          badge="The Problem"
          title="Why ICU Air Quality Matters"
          subtitle="Sealed environments save lives — but they also trap CO₂. Without proactive monitoring, air quality degrades silently."
        />
        <div className="grid sm:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <GlassCard key={p.title} delay={i * 0.12}>
              <span className="text-3xl block">{p.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-sky-300 transition-colors duration-300">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{p.desc}</p>
            </GlassCard>
          ))}
        </div>
      </ScrollSection>

      {/* ════════════════  HOW IT WORKS  ════════════════ */}
      <ScrollSection id="how-it-works" className="relative z-10 px-6 py-24 max-w-5xl mx-auto">
        <SectionHeading
          badge="Our Solution"
          title="Predict, Don't React"
          subtitle="AuraFlow uses machine learning to forecast CO₂ levels from real-time environmental data — giving you time to act."
        />
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <GlassCard key={s.num} delay={i * 0.12} className="text-center py-8 relative overflow-hidden">
              <span className="text-4xl font-extrabold glow-text">{s.num}</span>
              <h3 className="mt-3 text-base font-semibold text-white">{s.label}</h3>
              <p className="mt-2 text-xs text-slate-400">{s.desc}</p>
              {i < 2 && (
                <div className="hidden sm:flex absolute top-1/2 -right-3 w-6 text-sky-500/40 text-xl -translate-y-1/2 z-20 items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </ScrollSection>

      {/* ════════════════  FEATURES  ════════════════ */}
      <ScrollSection id="features" className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <SectionHeading
          badge="Features"
          title="Everything You Need"
          subtitle="A purpose-built toolkit for proactive ICU air quality management."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <GlassCard key={f.title} delay={i * 0.08}>
              <div className="w-10 h-10 rounded-xl bg-sky-500/[0.08] border border-sky-500/[0.12] flex items-center justify-center text-xl mb-3 group-hover:bg-sky-500/[0.15] group-hover:border-sky-500/25 transition-all duration-300">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-sky-300 transition-colors duration-300">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </ScrollSection>

      {/* ════════════════  DEMO PREVIEW  ════════════════ */}
      <ScrollSection id="demo" className="relative z-10 px-6 py-24 max-w-5xl mx-auto">
        <SectionHeading
          badge="Live Demo"
          title="See AuraFlow in Action"
          subtitle="Click below to try the prediction dashboard with sample ICU data."
        />
        <motion.div
          onClick={() => navigate('/dashboard')}
          className="cursor-pointer group"
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="glass-card glow-border relative overflow-hidden py-14 text-center rounded-2xl">
            {/* Faux UI Preview */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-3 justify-center mb-2">
                <div className="w-28 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] animate-pulse" style={{ animationDelay: '0s' }} />
                <div className="w-28 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="w-28 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
              <div className="w-44 h-10 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-sky-600/20">
                Predict CO₂
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-4xl font-bold text-white">482</span>
                <span className="text-sm text-slate-400">ppm</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Optimal
                </span>
              </div>
              {/* Mini chart bars */}
              <div className="flex items-end gap-1 mt-2 h-8">
                {[3, 5, 4, 7, 6, 8, 5, 9, 6, 7, 8, 5].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-2 rounded-full bg-gradient-to-t from-sky-500/60 to-teal-400/40"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h * 3.5}px` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  />
                ))}
              </div>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1e]/70 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl backdrop-blur-sm">
              <span className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 font-semibold text-white shadow-lg shadow-sky-600/30 flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                Try it Live
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </div>
          </div>
        </motion.div>
      </ScrollSection>

      {/* ════════════════  FINAL CTA  ════════════════ */}
      <ScrollSection id="cta" className="relative z-10 px-6 py-28 max-w-3xl mx-auto text-center">
        <motion.h2
          className="text-3xl sm:text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to Breathe Easier?
        </motion.h2>
        <motion.p
          className="text-slate-400 text-lg mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Start predicting ICU CO₂ levels in seconds — no setup, no sign-up.
        </motion.p>
        <motion.button
          onClick={() => navigate('/dashboard')}
          className="aura-btn-primary group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Launch Dashboard
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          {/* Outer glow ring */}
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-400 opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500" />
        </motion.button>
      </ScrollSection>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.04] py-8 text-center">
        <p className="text-sm text-slate-600">
          © {new Date().getFullYear()} AuraFlow · Built for safer ICU environments
        </p>
        <p className="text-xs text-slate-700 mt-1">
          AI-Powered Air Quality Intelligence
        </p>
      </footer>
    </div>
  )
}
