import { useEffect, useMemo, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import gsap from 'gsap'
import { Sparkles } from 'lucide-react'
import AIReportPanel from '../components/slumPlanner/AIReportPanel.jsx'
import AnalysisResultsPanel from '../components/slumPlanner/AnalysisResultsPanel.jsx'
import PlannerMap from '../components/slumPlanner/PlannerMap.jsx'
import RecommendationTable from '../components/slumPlanner/RecommendationTable.jsx'
import WardPlanningPanel from '../components/slumPlanner/WardPlanningPanel.jsx'
import { plannerWards, scanSteps } from '../mock/slumPlannerData.js'
import { analyzeWardInfrastructure } from '../services/slumPlannerApi.js'
import { useSlumPlannerStore } from '../store/slumPlannerStore.js'
import { useShellStore } from '../store/shellStore.js'
import { ROUTES, slumPlannerWardId } from '../lib/navigation/routes.js'

function PlannerHero({ selectedWard, analysis }) {
  return (
    <section data-reveal className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/78 p-5 shadow-premium backdrop-blur-xl md:p-6">
      <div className="hero-orb -right-24 -top-28 animate-depth" />
      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-product-line bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-product-slate shadow-soft">
            <Sparkles size={14} className="text-product-indigo" aria-hidden="true" />
            AI-assisted urban infrastructure planning
          </div>
          <h2 className="mt-4 max-w-4xl font-display text-3xl font-bold tracking-[-0.045em] text-product-navy md:text-5xl">
            Scan informal settlements, surface risk, and generate a remediation plan.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-product-slate md:text-base">
            Select a Bengaluru ward, analyze spatial infrastructure signals, and convert AI findings into capital works, policy actions, and population impact estimates.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-product-line bg-product-navy p-4 text-white shadow-premium">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Current ward</p>
            <p className="mt-2 text-lg font-bold leading-tight">{selectedWard.shortName}</p>
            <p className="mt-1 text-xs font-semibold text-white/75">{selectedWard.pressure} pressure</p>
          </div>
          <div className="rounded-[24px] border border-product-line bg-white p-4 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-product-slate">Informal HH</p>
            <p className="mt-2 font-display text-3xl font-bold text-product-ink">{selectedWard.informalHouseholds.toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-[24px] border border-cyan-200 bg-cyan-50 p-4 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-800">Scan state</p>
            <p className="mt-2 font-display text-3xl font-bold text-product-navy">{analysis ? 'Ready' : 'New'}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function SlumPlannerPage() {
  const pageRef = useRef(null)
  const [searchParams] = useSearchParams()
  const selectedWardId = useSlumPlannerStore((state) => state.selectedWardId)
  const analysis = useSlumPlannerStore((state) => state.analysis)
  const isScanning = useSlumPlannerStore((state) => state.isScanning)
  const scanStep = useSlumPlannerStore((state) => state.scanStep)
  const demoMode = useSlumPlannerStore((state) => state.demoMode)
  const setSelectedWardId = useSlumPlannerStore((state) => state.setSelectedWardId)
  const startScanning = useSlumPlannerStore((state) => state.startScanning)
  const setScanStep = useSlumPlannerStore((state) => state.setScanStep)
  const setAnalysis = useSlumPlannerStore((state) => state.setAnalysis)
  const stopScanning = useSlumPlannerStore((state) => state.stopScanning)
  const selectedWard = useMemo(() => plannerWards.find((ward) => ward.id === selectedWardId) || plannerWards[0], [selectedWardId])

  useEffect(() => {
    const wardParam = searchParams.get('ward')
    if (!wardParam) return
    const resolvedWardParam = slumPlannerWardId(wardParam)
    const normalized = resolvedWardParam.toLowerCase()
    const matched = plannerWards.find((ward) => (
      ward.id === resolvedWardParam ||
      normalized.includes(ward.shortName.toLowerCase().replace(/\s+/g, '-')) ||
      ward.shortName.toLowerCase().replace(/\s+/g, '-').includes(normalized.replace('ward-', ''))
    ))
    if (matched && matched.id !== selectedWardId) setSelectedWardId(matched.id)
  }, [searchParams, selectedWardId, setSelectedWardId])

  const mutation = useMutation({
    mutationFn: analyzeWardInfrastructure,
    onSuccess: (result) => {
      setAnalysis(result.analysis, result.demoMode)
      useShellStore.getState().pushNotification({
        kind: 'ai',
        tone: result.demoMode ? 'warn' : 'good',
        title: 'Ward scan complete',
        message: `${selectedWard.shortName} remediation plan is ready`,
        route: ROUTES.SLUM_PLANNER,
      })
    },
    onError: () => {
      stopScanning()
      useShellStore.getState().pushNotification({
        kind: 'ai',
        tone: 'danger',
        title: 'Ward scan failed',
        message: 'Scan failed. Please try again.',
        route: ROUTES.SLUM_PLANNER,
      })
    },
  })

  useEffect(() => {
    if (!pageRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(
      pageRef.current.querySelectorAll('[data-reveal]'),
      { autoAlpha: 0, y: 20, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.68, stagger: 0.06, ease: 'power3.out' },
    )
  }, [])

  useEffect(() => {
    if (!analysis || !pageRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(
      pageRef.current.querySelectorAll('[data-result]'),
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'power3.out' },
    )
  }, [analysis])

  const runScan = async () => {
    if (isScanning) return
    startScanning()

    for (let index = 0; index < scanSteps.length; index += 1) {
      setScanStep(index)
      await new Promise((resolve) => window.setTimeout(resolve, 520))
    }

    mutation.mutate(selectedWard)
  }

  return (
    <div ref={pageRef} className="mx-auto max-w-[1640px] space-y-6 px-3 pb-28 pt-4 md:px-8">
      <PlannerHero selectedWard={selectedWard} analysis={analysis} />

      <section className="grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)_430px]">
        <div data-reveal>
          <WardPlanningPanel
            wards={plannerWards}
            selectedWard={selectedWard}
            isScanning={isScanning}
            scanSteps={scanSteps}
            scanStep={scanStep}
            onWardChange={setSelectedWardId}
            onRunScan={runScan}
          />
        </div>

        <div data-reveal>
          <PlannerMap ward={selectedWard} isScanning={isScanning} analysis={analysis} />
        </div>

        <div data-reveal className="space-y-5">
          <div data-result>
            <AnalysisResultsPanel analysis={analysis} />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_1.2fr]">
        <div data-reveal data-result>
          <AIReportPanel analysis={analysis} />
        </div>
        {analysis && (
          <div data-reveal data-result>
            <RecommendationTable recommendations={analysis.recommendations} />
          </div>
        )}
      </section>
    </div>
  )
}
