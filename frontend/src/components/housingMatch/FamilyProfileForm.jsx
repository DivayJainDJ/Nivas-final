import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CheckCircle2, FileCheck2, LocateFixed, UserRound } from 'lucide-react'
import { documentChecklist } from '../../mock/housingMatchData.js'

const schema = z.object({
  name: z.string().min(3, 'Enter full name.'),
  phone: z.string().min(10, 'Enter a valid phone number.'),
  annualIncome: z.coerce.number().min(1, 'Enter annual income.'),
  householdSize: z.coerce.number().min(1).max(12),
  category: z.enum(['EWS', 'LIG', 'MIG']),
  currentAddress: z.string().min(6, 'Enter current address.'),
  preferredDistanceKm: z.coerce.number().min(1).max(30),
  accessibilityRequirements: z.string().optional(),
  aadhaar: z.boolean().optional(),
  incomeCertificate: z.boolean().optional(),
  rationCard: z.boolean().optional(),
  domicileCertificate: z.boolean().optional(),
  bankDetails: z.boolean().optional(),
})

const steps = ['Family', 'Location', 'Documents']

export default function FamilyProfileForm({ step, setStep, onSubmitProfile, isMatching }) {
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 })
  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'EWS',
      householdSize: 4,
      preferredDistanceKm: 8,
      aadhaar: false,
      incomeCertificate: true,
      rationCard: true,
      domicileCertificate: false,
      bankDetails: false,
    },
  })

  useEffect(() => {
    setValue('currentAddress', 'Shivajinagar, Bengaluru')
  }, [setValue])

  const fieldsByStep = useMemo(
    () => [
      ['name', 'phone', 'annualIncome', 'householdSize', 'category'],
      ['currentAddress', 'preferredDistanceKm'],
      [],
    ],
    [],
  )

  const next = async () => {
    const valid = await trigger(fieldsByStep[step])
    if (valid) setStep(Math.min(step + 1, steps.length - 1))
  }

  const captureLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((position) => {
      const nextLocation = { lat: position.coords.latitude, lng: position.coords.longitude }
      setLocation(nextLocation)
      setValue('currentAddress', `Detected location near ${nextLocation.lat.toFixed(4)}, ${nextLocation.lng.toFixed(4)}`, { shouldValidate: true })
    })
  }

  const submit = (values) => {
    onSubmitProfile({
      id: `family-${Date.now()}`,
      name: values.name,
      phone: values.phone,
      annualIncome: values.annualIncome,
      householdSize: values.householdSize,
      category: values.category,
      currentAddress: values.currentAddress,
      preferredDistanceKm: values.preferredDistanceKm,
      accessibilityRequirements: values.accessibilityRequirements || '',
      location,
      documents: {
        aadhaar: Boolean(values.aadhaar),
        incomeCertificate: Boolean(values.incomeCertificate),
        rationCard: Boolean(values.rationCard),
        domicileCertificate: Boolean(values.domicileCertificate),
        bankDetails: Boolean(values.bankDetails),
      },
    })
  }

  return (
    <section className="command-panel rounded-[30px] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Family onboarding</p>
          <h2 className="mt-1 font-display text-xl font-bold text-product-navy">Eligibility profile</h2>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-product-indigo">
          <UserRound size={18} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {steps.map((label, index) => (
          <button key={label} type="button" onClick={() => setStep(index)} className={`rounded-2xl px-3 py-2 text-xs font-bold transition ${step === index ? 'bg-product-navy text-white shadow-soft' : 'bg-white text-product-slate'}`}>
            {index + 1}. {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(submit)} className="mt-5">
        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" error={errors.name?.message}><input {...register('name')} className="field-input" placeholder="Ravi Kumar" /></Field>
            <Field label="Phone number" error={errors.phone?.message}><input {...register('phone')} className="field-input" placeholder="+919999999999" /></Field>
            <Field label="Annual income" error={errors.annualIncome?.message}><input {...register('annualIncome')} className="field-input" placeholder="240000" /></Field>
            <Field label="Household size" error={errors.householdSize?.message}><input type="number" {...register('householdSize')} className="field-input" /></Field>
            <Field label="Housing category" error={errors.category?.message}>
              <select {...register('category')} className="field-input"><option>EWS</option><option>LIG</option><option>MIG</option></select>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4">
            <Field label="Current address" error={errors.currentAddress?.message}>
              <div className="flex gap-2">
                <input {...register('currentAddress')} className="field-input" />
                <button type="button" onClick={captureLocation} className="rounded-2xl border border-product-line bg-white px-3 text-product-indigo shadow-soft"><LocateFixed size={18} /></button>
              </div>
            </Field>
            <Field label="Preferred distance range (km)" error={errors.preferredDistanceKm?.message}>
              <input type="number" {...register('preferredDistanceKm')} className="field-input" />
            </Field>
            <Field label="Accessibility requirements">
              <textarea {...register('accessibilityRequirements')} rows="3" className="field-input resize-none" placeholder="Ground floor, wheelchair access, elder-friendly access..." />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {documentChecklist.map((doc) => (
                <label key={doc.key} className="flex items-center gap-3 rounded-2xl border border-product-line bg-white p-3 shadow-soft">
                  <input type="checkbox" {...register(doc.key)} className="h-4 w-4 rounded border-product-line" />
                  <FileCheck2 size={17} className="text-product-indigo" />
                  <span className="text-sm font-bold text-product-navy">{doc.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
              <CheckCircle2 className="mr-2 inline" size={17} />
              Documents can be completed later, but missing items may affect waitlist timing.
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="rounded-2xl border border-product-line bg-white px-4 py-3 text-sm font-bold text-product-navy shadow-soft">Back</button>}
          {step < steps.length - 1 ? (
            <button type="button" onClick={next} className="flex-1 rounded-2xl bg-product-navy px-4 py-3 text-sm font-bold text-white shadow-soft">Continue</button>
          ) : (
            <button type="submit" disabled={isMatching} className="flex-1 rounded-2xl bg-gradient-to-r from-product-navy to-product-indigo px-4 py-3 text-sm font-bold text-white shadow-premium disabled:opacity-70">
              {isMatching ? 'Finding housing matches...' : 'Find housing matches'}
            </button>
          )}
        </div>
      </form>
    </section>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-product-slate">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs font-bold text-rose-600">{error}</p>}
    </label>
  )
}
