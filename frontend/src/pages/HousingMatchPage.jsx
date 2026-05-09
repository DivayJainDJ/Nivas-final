import { useEffect, useRef } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import gsap from 'gsap'
import { Sparkles } from 'lucide-react'
import EligibilityPanel from '../components/housingMatch/EligibilityPanel.jsx'
import FamilyProfileForm from '../components/housingMatch/FamilyProfileForm.jsx'
import HousingAnalytics from '../components/housingMatch/HousingAnalytics.jsx'
import HousingMap from '../components/housingMatch/HousingMap.jsx'
import HousingMatchCards from '../components/housingMatch/HousingMatchCards.jsx'
import UnitDetailModal from '../components/housingMatch/UnitDetailModal.jsx'
import WaitlistSimulation from '../components/housingMatch/WaitlistSimulation.jsx'
import { demoHousingUnits } from '../mock/housingMatchData.js'
import { matchHousing } from '../services/housingMatchApi.js'
import { saveFamilyProfile } from '../services/housingMatchRepository.js'
import { useHousingMatchStore } from '../store/housingMatchStore.js'
import { useShellStore } from '../store/shellStore.js'
import { ROUTES } from '../lib/navigation/routes.js'

function HousingHero({ result }) {
  return (
    <section data-reveal className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/78 p-5 shadow-premium backdrop-blur-xl md:p-6">
      <div className="hero-orb -right-24 -top-28 animate-depth" />
      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_560px] xl:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-product-line bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-product-slate shadow-soft">
            <Sparkles size={14} className="text-product-indigo" />
            AI-assisted public welfare allocation
          </div>
          <h2 className="mt-4 max-w-4xl font-display text-3xl font-bold tracking-[-0.045em] text-product-navy md:text-5xl">
            Find affordable housing options with clarity, dignity, and transparency.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-product-slate md:text-base">
            Families can understand eligibility, document readiness, waitlist risk, and nearby housing opportunities without navigating bureaucracy alone.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroMetric label="Best match" value={result ? `${result.matches[0].matchScore}%` : 'New'} />
          <HeroMetric label="Approval" value={result ? `${result.eligibility.approvalConfidence}%` : '--'} tone="bg-emerald-50 text-emerald-700 border-emerald-100" />
          <HeroMetric label="Options" value={result ? result.matches.length : demoHousingUnits.length} tone="bg-cyan-50 text-cyan-800 border-cyan-100" />
        </div>
      </div>
    </section>
  )
}

function HeroMetric({ label, value, tone = 'bg-product-navy text-white border-product-line' }) {
  return (
    <div className={`rounded-[24px] border p-4 shadow-soft ${tone}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-75">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  )
}

export default function HousingMatchPage() {
  const pageRef = useRef(null)
  const resultRef = useRef(null)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const step = useHousingMatchStore((state) => state.step)
  const setStep = useHousingMatchStore((state) => state.setStep)
  const familyProfile = useHousingMatchStore((state) => state.familyProfile)
  const setFamilyProfile = useHousingMatchStore((state) => state.setFamilyProfile)
  const matchResult = useHousingMatchStore((state) => state.matchResult)
  const isMatching = useHousingMatchStore((state) => state.isMatching)
  const demoMode = useHousingMatchStore((state) => state.demoMode)
  const startMatching = useHousingMatchStore((state) => state.startMatching)
  const setMatchResult = useHousingMatchStore((state) => state.setMatchResult)
  const setSelectedUnit = useHousingMatchStore((state) => state.setSelectedUnit)
  const closeUnit = useHousingMatchStore((state) => state.closeUnit)

  const mutation = useMutation({
    mutationFn: matchHousing,
    onSuccess: (response) => {
      setMatchResult(response.result, response.demoMode)
      const topMatch = response.result?.matches?.[0]
      useShellStore.getState().pushNotification({
        kind: 'housing',
        tone: response.demoMode ? 'warn' : 'good',
        title: 'Housing match ready',
        message: topMatch ? `Top match: ${topMatch.projectName} (${topMatch.matchScore}% match)` : 'Recommendations are ready',
        route: ROUTES.HOUSING_MATCH,
      })
    },
    onError: () => {
      setMatchResult(null, true)
      useShellStore.getState().pushNotification({
        kind: 'housing',
        tone: 'warn',
        title: 'Continuity mode',
        message: 'Using demo recommendations while services recover.',
        route: ROUTES.HOUSING_MATCH,
      })
    },
  })

  useEffect(() => {
    if (!pageRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(pageRef.current.querySelectorAll('[data-reveal]'), { autoAlpha: 0, y: 18, scale: 0.988 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.62, stagger: 0.055, ease: 'power3.out' })
  }, [])

  useEffect(() => {
    if (!matchResult || !resultRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(resultRef.current.querySelectorAll('[data-result]'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'power3.out' })
  }, [matchResult])

  useEffect(() => {
    const unitId = searchParams.get('unit') || location.state?.unitId
    if (!unitId) return
    const unit = (matchResult?.matches || demoHousingUnits).find((item) => item.id === unitId)
    if (unit) setSelectedUnit(unit)
  }, [location.state, matchResult, searchParams, setSelectedUnit])

  useEffect(() => () => closeUnit(), [closeUnit])

  const submitProfile = async (profile) => {
    setFamilyProfile(profile)
    startMatching()
    try {
      await saveFamilyProfile(profile)
    } catch {
      // Saving is optional in demo mode; matching still proceeds.
    }
    await new Promise((resolve) => window.setTimeout(resolve, 700))
    mutation.mutate(profile)
  }

  const matches = matchResult?.matches || demoHousingUnits

  return (
    <div ref={pageRef} className="mx-auto max-w-[1640px] space-y-6 px-3 pb-28 pt-4 md:px-8">
      <HousingHero result={matchResult} />
      <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)_390px]">
        <div data-reveal>
          <FamilyProfileForm step={step} setStep={setStep} onSubmitProfile={submitProfile} isMatching={isMatching} />
        </div>
        <div data-reveal>
          <HousingMap familyProfile={familyProfile} matches={matches} onSelectUnit={setSelectedUnit} />
        </div>
        <div data-reveal className="space-y-5">
          <EligibilityPanel result={matchResult} />
          <WaitlistSimulation waitlist={matchResult?.waitlist} />
        </div>
      </section>

      <div ref={resultRef} className="space-y-5">
        {matchResult && (
          <div data-result>
            <HousingAnalytics analytics={matchResult.analytics} />
          </div>
        )}
        <div data-reveal data-result>
          <HousingMatchCards matches={matchResult?.matches || []} onSelectUnit={setSelectedUnit} />
        </div>
      </div>

      <UnitDetailModal />
    </div>
  )
}
