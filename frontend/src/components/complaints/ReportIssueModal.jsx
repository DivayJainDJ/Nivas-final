import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Bot, Camera, CheckCircle2, LocateFixed, Upload, X } from 'lucide-react'
import { complaintCategories } from '../../mock/complaintsDemoData.js'
import { wards } from '../../mock/civicData.js'

const schema = z.object({
  description: z.string().min(16, 'Describe the issue in at least 16 characters.'),
  category: z.string().min(1, 'Select a category.'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  address: z.string().min(6, 'Add an address or landmark.'),
  residentPhone: z.string().min(10, 'Enter a valid phone number.'),
  wardId: z.string().min(1, 'Select a ward.'),
  aiAssist: z.boolean().optional(),
})

export default function ReportIssueModal({ open, onClose, onSubmitComplaint, isSubmitting, success }) {
  const [photo, setPhoto] = useState(null)
  const [location, setLocation] = useState(null)
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : ''), [photo])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'Drainage issue',
      urgency: 'medium',
      wardId: wards[0].id,
      aiAssist: true,
    },
  })

  useEffect(() => {
    if (!open) {
      reset()
      setPhoto(null)
      setLocation(null)
    }
  }, [open, reset])

  if (!open) return null

  const captureLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((position) => {
      const nextLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
      setLocation(nextLocation)
      setValue('address', `Detected location near ${nextLocation.lat.toFixed(4)}, ${nextLocation.lng.toFixed(4)}`, { shouldValidate: true })
    })
  }

  const submit = (values) => {
    const ward = wards.find((item) => item.id === values.wardId) || wards[0]
    onSubmitComplaint({
      ...values,
      severity: values.urgency,
      photo,
      location: location || ward.center,
      wardName: ward.name,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-product-navy/24 p-0 backdrop-blur-sm md:items-center md:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-t-[32px] border border-white/80 bg-white shadow-premium md:rounded-[32px]">
        <header className="flex items-start justify-between gap-3 border-b border-product-line p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-product-slate">Resident report</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] text-product-navy">Report a civic issue</h2>
            <p className="mt-1 text-sm text-product-slate">Your report is routed to the municipal response workflow.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-product-line bg-white p-2 text-product-slate shadow-soft hover:text-product-navy" aria-label="Close report form">
            <X size={18} />
          </button>
        </header>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
            <h3 className="mt-4 font-display text-2xl font-bold text-product-navy">Complaint submitted</h3>
            <p className="mt-2 text-sm text-product-slate">Tracking ID: <span className="font-mono font-bold text-product-ink">{success}</span></p>
            <p className="mt-1 text-sm text-product-slate">Status: pending AI classification and department routing.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(submit)} className="max-h-[calc(94vh-92px)] overflow-y-auto p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Category" error={errors.category?.message}>
                <select {...register('category')} className="field-input">
                  {complaintCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </Field>
              <Field label="Urgency" error={errors.urgency?.message}>
                <select {...register('urgency')} className="field-input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </Field>
              <Field label="Ward" error={errors.wardId?.message}>
                <select {...register('wardId')} className="field-input">
                  {wards.map((ward) => <option key={ward.id} value={ward.id}>{ward.name}</option>)}
                </select>
              </Field>
              <Field label="Phone number" error={errors.residentPhone?.message}>
                <input {...register('residentPhone')} className="field-input" placeholder="+91 phone number" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Description" error={errors.description?.message}>
                  <textarea {...register('description')} rows="4" className="field-input resize-none" placeholder="Describe what happened, where it is, and who is affected." />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Address or landmark" error={errors.address?.message}>
                  <div className="flex gap-2">
                    <input {...register('address')} className="field-input" placeholder="Street, landmark, settlement, or ward area" />
                    <button type="button" onClick={captureLocation} className="shrink-0 rounded-2xl border border-product-line bg-white px-3 text-product-indigo shadow-soft" aria-label="Capture current location">
                      <LocateFixed size={18} />
                    </button>
                  </div>
                </Field>
              </div>
              <div className="md:col-span-2">
                <label
                  className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-product-line bg-product-cloud p-4 text-center transition hover:bg-white"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    setPhoto(event.dataTransfer.files?.[0] || null)
                  }}
                >
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => setPhoto(event.target.files?.[0] || null)} />
                  {preview ? <img src={preview} alt="Complaint upload preview" className="max-h-44 rounded-2xl object-cover shadow-soft" /> : (
                    <>
                      <Upload className="text-product-indigo" size={28} />
                      <p className="mt-2 text-sm font-bold text-product-navy">Upload photo or use camera</p>
                      <p className="mt-1 text-xs text-product-slate">Drag and drop on desktop. Camera-first on mobile.</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 p-3 text-sm font-semibold text-product-navy">
              <input type="checkbox" {...register('aiAssist')} className="h-4 w-4 rounded border-product-line" />
              <Bot size={17} className="text-product-indigo" />
              Enable AI-assisted classification and routing
            </label>

            <button type="submit" disabled={isSubmitting} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-product-navy to-product-indigo px-4 py-3 text-sm font-bold text-white shadow-premium transition hover:-translate-y-0.5 disabled:opacity-70">
              <Camera size={17} />
              {isSubmitting ? 'Submitting report...' : 'Submit complaint'}
            </button>
          </form>
        )}
      </div>
    </div>
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
