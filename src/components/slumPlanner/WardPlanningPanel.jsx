import { Building2, Play, ShieldCheck } from 'lucide-react'
import AnalysisSequence from './AnalysisSequence.jsx'

export default function WardPlanningPanel({ wards, selectedWard, isScanning, scanSteps, scanStep, onWardChange, onRunScan }) {
  return (
    <aside className="command-panel rounded-[30px] p-5" aria-labelledby="planning-panel-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Planning context</p>
          <h2 id="planning-panel-title" className="mt-1 font-display text-xl font-bold tracking-[-0.03em] text-product-navy">
            Ward scan setup
          </h2>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-product-indigo">
          <Building2 size={18} aria-hidden="true" />
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-product-slate">Select ward</span>
        <select
          value={selectedWard.id}
          onChange={(event) => onWardChange(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-product-line bg-white px-3 py-3 text-sm font-bold text-product-navy shadow-soft outline-none transition focus:border-product-indigo focus:ring-4 focus:ring-indigo-100"
        >
          {wards.map((ward) => (
            <option key={ward.id} value={ward.id}>
              {ward.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[22px] border border-product-line bg-white/80 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-product-slate">Population</p>
          <p className="mt-1 font-display text-2xl font-bold text-product-ink">{selectedWard.population.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-[22px] border border-orange-100 bg-orange-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">Informal HH</p>
          <p className="mt-1 font-display text-2xl font-bold text-product-ink">{selectedWard.informalHouseholds.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-product-line bg-white/75 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-product-navy">
          <ShieldCheck size={17} className="text-emerald-700" aria-hidden="true" />
          Analysis scope
        </div>
        <p className="mt-2 text-sm leading-6 text-product-slate">
          Satellite-derived settlement density, road continuity, sanitation access, drainage stress, and water service patterns.
        </p>
      </div>

      <button
        type="button"
        onClick={onRunScan}
        disabled={isScanning}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-product-navy to-product-indigo px-4 py-3 text-sm font-bold text-white shadow-premium transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Play size={17} aria-hidden="true" />
        {isScanning ? 'Scanning infrastructure...' : 'Run AI Infrastructure Scan'}
      </button>

      {isScanning && <div className="mt-5"><AnalysisSequence steps={scanSteps} activeStep={scanStep} /></div>}
    </aside>
  )
}
