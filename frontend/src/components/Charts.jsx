import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line,
  AreaChart, Area,
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card !rounded-lg px-4 py-3 !transform-none text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  )
}

/* ─── Wrapper for chart cards ─── */
const ChartCard = ({ title, subtitle, children, delay = 0 }) => (
  <motion.div
    className="glass-card glow-border p-6 rounded-2xl"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    <div className="mb-4">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
    <div className="h-64">
      {children}
    </div>
  </motion.div>
)

/* ═══════════════════════════════════════════
   CO₂ TREND LINE CHART
   ═══════════════════════════════════════════ */
export function CO2TrendChart({ predictionHistory }) {
  const data = useMemo(() => {
    if (!predictionHistory?.length) {
      // Generate demo data
      return Array.from({ length: 12 }, (_, i) => ({
        time: `${i * 5}m`,
        co2: 420 + Math.sin(i * 0.6) * 80 + Math.random() * 30,
      }))
    }
    return predictionHistory.map((p, i) => ({
      time: `${p.time_min || i * 5}m`,
      co2: p.predicted_co2,
    }))
  }, [predictionHistory])

  return (
    <ChartCard
      title="CO₂ Trend"
      subtitle="Real-time concentration monitoring"
      delay={0.1}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="co2LineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={800} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'Danger', fill: '#ef4444', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={600} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.3} label={{ value: 'Warning', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
          <Line
            type="monotone"
            dataKey="co2"
            name="CO₂ (ppm)"
            stroke="url(#co2LineGradient)"
            strokeWidth={2.5}
            dot={{ fill: '#0ea5e9', r: 3, strokeWidth: 0 }}
            activeDot={{ fill: '#38bdf8', r: 5, strokeWidth: 2, stroke: '#0ea5e9' }}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* ═══════════════════════════════════════════
   PREDICTION vs SAFE THRESHOLD AREA CHART
   ═══════════════════════════════════════════ */
export function PredictionAreaChart({ predictionHistory }) {
  const data = useMemo(() => {
    if (!predictionHistory?.length) {
      return Array.from({ length: 12 }, (_, i) => ({
        time: `${i * 5}m`,
        predicted: 420 + Math.sin(i * 0.5) * 120 + Math.random() * 40,
        safe: 600,
      }))
    }
    return predictionHistory.map((p, i) => ({
      time: `${p.time_min || i * 5}m`,
      predicted: p.predicted_co2,
      safe: 600,
    }))
  }, [predictionHistory])

  return (
    <ChartCard
      title="Predicted vs Safe Threshold"
      subtitle="Gradient fill shows risk zones"
      delay={0.25}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="safeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="safe"
            name="Safe Threshold"
            stroke="#22c55e"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="url(#safeGradient)"
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="predicted"
            name="Predicted CO₂"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="url(#predictedGradient)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* ═══════════════════════════════════════════
   INPUT PARAMETER IMPACT BAR CHART
   ═══════════════════════════════════════════ */
export function ParameterImpactChart({ formData }) {
  const data = useMemo(() => {
    if (!formData) {
      return [
        { param: 'Time', value: 30, fill: '#0ea5e9' },
        { param: 'Occupancy', value: 4, fill: '#2dd4bf' },
        { param: 'Vent Eff.', value: 0.85, fill: '#a78bfa' },
        { param: 'Vent Rate', value: 6, fill: '#f59e0b' },
        { param: 'Temp (°C)', value: 22.5, fill: '#ef4444' },
        { param: 'Humidity', value: 45, fill: '#ec4899' },
      ]
    }
    return [
      { param: 'Time', value: parseFloat(formData.time_min) || 0, fill: '#0ea5e9' },
      { param: 'Occupancy', value: parseFloat(formData.occupancy) || 0, fill: '#2dd4bf' },
      { param: 'Vent Eff.', value: (parseFloat(formData.ventilation_efficiency) || 0) * 100, fill: '#a78bfa' },
      { param: 'Vent Rate', value: parseFloat(formData.ventilation_rate) || 0, fill: '#f59e0b' },
      { param: 'Temp', value: parseFloat(formData.temperature_c) || 0, fill: '#ef4444' },
      { param: 'Humidity', value: parseFloat(formData.humidity_pct) || 0, fill: '#ec4899' },
    ]
  }, [formData])

  return (
    <ChartCard
      title="Input Parameter Overview"
      subtitle="Current environmental readings scaled"
      delay={0.4}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="param" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            name="Value"
            radius={[6, 6, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
