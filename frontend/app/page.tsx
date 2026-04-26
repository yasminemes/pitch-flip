'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

type Mode = 'single' | 'bulk'

type SampleDeck = {
  file: string
  thumb: string
  company: string
  tagline: string
  sector: string
  sectorColor: string
  prospect: { company: string; title: string; department: string }
}

const SAMPLE_DECKS: SampleDeck[] = [
  {
    file: 'lexara.pdf',
    thumb: '/samples/lexara-thumb.png',
    company: 'Lexara',
    tagline: 'AI contract review that cuts risk analysis from days to minutes.',
    sector: 'Legal Tech',
    sectorColor: 'bg-sky-100 text-sky-700',
    prospect: { company: 'HSBC', title: 'Head of Legal Operations', department: 'Legal' },
  },
  {
    file: 'carbon-ledger.pdf',
    thumb: '/samples/carbon-ledger-thumb.png',
    company: 'Carbon Ledger',
    tagline: 'Real-time Scope 3 emissions tracking, pulled live from your ERP.',
    sector: 'Climate Tech',
    sectorColor: 'bg-emerald-100 text-emerald-700',
    prospect: { company: 'Unilever', title: 'Chief Sustainability Officer', department: 'Sustainability' },
  },
]

type ProspectResult = {
  company: string
  index: number
  status: 'pending' | 'generating' | 'done'
  output: string
}

// ── Logo ──────────────────────────────────────────────────────────────────────

function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stacked slides — back layers */}
      <rect x="11" y="13" width="22" height="15" rx="3" fill="#BFDBFE" />
      <rect x="7" y="9" width="22" height="15" rx="3" fill="#93C5FD" />
      {/* Front slide */}
      <rect x="4" y="6" width="22" height="15" rx="3" fill="#1D4ED8" />
      {/* Content lines */}
      <rect x="8" y="10" width="11" height="2" rx="1" fill="white" opacity="0.95" />
      <rect x="8" y="14" width="8" height="1.5" rx="0.75" fill="white" opacity="0.55" />
      <rect x="8" y="17" width="10" height="1.5" rx="0.75" fill="white" opacity="0.55" />
      {/* Flip arrow */}
      <path d="M30 9 C34 9 36 13 34 17" stroke="#1D4ED8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M32 15 L34 17 L36 15" stroke="#1D4ED8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

// ── Animated demo ─────────────────────────────────────────────────────────────

const INVESTOR_ROWS = [
  { label: 'Market', value: 'TAM: £2.3B' },
  { label: 'Stage', value: 'Series A — £3M raise' },
  { label: 'Traction', value: '5 enterprise pilots' },
  { label: 'Runway', value: '18 months' },
]

const SALES_LINES: { text: string; style: 'heading' | 'body' | 'strong' }[] = [
  { text: 'Contract risk, surfaced in seconds', style: 'heading' },
  { text: 'Your team reviews 40+ contracts a month.', style: 'body' },
  { text: 'Each one ties up 3 days of senior lawyer time.', style: 'body' },
  { text: 'Lexara cuts that to under an hour — automatically.', style: 'body' },
  { text: 'No missed deadlines. No liability gaps.', style: 'strong' },
]

function AnimatedDemo() {
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setAnimKey(k => k + 1), 8000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="mt-14 flex items-start gap-5 max-w-2xl mx-auto select-none">

      {/* Left — Investor deck */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5 text-center">
          Investor deck
        </p>
        <div className="bg-blue-800 rounded-2xl p-5 shadow-md">
          <p className="text-[10px] text-blue-300/70 font-medium mb-3">Lexara · Seed Deck 2025</p>
          <div className="space-y-2.5">
            {INVESTOR_ROWS.map(row => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <span className="text-[10px] text-blue-300/60 shrink-0">{row.label}</span>
                <span className="text-[10px] text-white font-medium text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle — transform indicator */}
      <div className="flex flex-col items-center pt-12 gap-2 shrink-0">
        <div className="w-10 h-px bg-amber-300" />
        <div className="text-center">
          <p className="text-sm text-amber-500 font-bold leading-tight">✦ AI</p>
          <p className="text-sm text-amber-500 font-bold leading-tight">Research</p>
          <p className="text-sm text-amber-500 font-bold leading-tight">Agents</p>
        </div>
        <div className="w-10 h-px bg-amber-300" />
      </div>

      {/* Right — Sales narrative (animated) */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5 text-center">
          Sales narrative
        </p>
        <div key={animKey} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm min-h-[140px]">
          <div className="space-y-2">
            {SALES_LINES.map((line, i) => (
              <div
                key={i}
                style={{
                  animationName: 'fadeSlideUp',
                  animationDuration: '0.45s',
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${i * 0.65}s`,
                }}
              >
                {line.style === 'heading' && (
                  <p className="text-[11px] font-bold text-blue-700 leading-snug">{line.text}</p>
                )}
                {line.style === 'body' && (
                  <p className="text-[10px] text-gray-500 leading-relaxed">{line.text}</p>
                )}
                {line.style === 'strong' && (
                  <p className="text-[10px] font-semibold text-gray-800 leading-relaxed">{line.text}</p>
                )}
              </div>
            ))}
            {/* Blinking cursor on last line */}
            <span
              className="cursor-blink inline-block w-0.5 h-3 bg-blue-500 ml-0.5 align-middle"
              style={{ animationDelay: `${SALES_LINES.length * 0.65}s` }}
            />
          </div>
        </div>
      </div>

    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [mode, setMode] = useState<Mode>('single')

  const [companyName, setCompanyName] = useState('')
  const [contactTitle, setContactTitle] = useState('')
  const [contactDepartment, setContactDepartment] = useState('')
  const [singleOutput, setSingleOutput] = useState('')
  const [copiedSingle, setCopiedSingle] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [buyerBrief, setBuyerBrief] = useState('')
  const [showBrief, setShowBrief] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [results, setResults] = useState<ProspectResult[]>([])
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const [deckFile, setDeckFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingSample, setLoadingSample] = useState<string | null>(null)
  const [slidesLoading, setSlidesLoading] = useState(false)
  const [slidesStatus, setSlidesStatus] = useState('')
  const [slidesError, setSlidesError] = useState('')

  const isTailored = companyName.trim().length > 0

  const loadSample = async (sample: SampleDeck) => {
    setLoadingSample(sample.file)
    try {
      const resp = await fetch(`/samples/${sample.file}`)
      const blob = await resp.blob()
      const mime = sample.file.endsWith('.pdf')
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      const file = new File([blob], sample.file, { type: mime })
      setDeckFile(file)
      setCompanyName(sample.prospect.company)
      setContactTitle(sample.prospect.title)
      setContactDepartment(sample.prospect.department)
      setMode('single')
      setSingleOutput('')
      setBuyerBrief('')
      setShowBrief(false)
      setEditMode(false)
    } catch {
      // silently ignore
    } finally {
      setLoadingSample(null)
    }
  }

  const downloadTemplate = () => {
    const csv = 'Customer Name,Contact Name,Job Title\nStripe,John Smith,Head of Sales\nNotion,Sarah Lee,VP of Product\n'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pitchflip-prospects.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSingleSubmit = async () => {
    if (!deckFile) return
    setLoading(true)
    setError('')
    setSingleOutput('')
    setStatusMessage('')
    setBuyerBrief('')
    setShowBrief(false)
    setEditMode(false)

    const formData = new FormData()
    formData.append('file', deckFile)
    formData.append('company_name', companyName.trim())
    formData.append('contact_title', contactTitle.trim())
    formData.append('contact_department', contactDepartment.trim())

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rewrite`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Something went wrong.')
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let done = false

      while (!done) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') { done = true; break }
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'status') {
              setStatusMessage(parsed.text)
            } else if (parsed.type === 'text') {
              accumulated += parsed.text
              setSingleOutput(accumulated)
              setStatusMessage('')
            } else if (parsed.type === 'brief') {
              setBuyerBrief(parsed.data)
            } else if (parsed.text) {
              accumulated += parsed.text
              setSingleOutput(accumulated)
            }
          } catch {}
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
      setStatusMessage('')
    }
  }

  const handleBulkSubmit = async () => {
    if (!deckFile || !csvFile) return
    setLoading(true)
    setError('')
    setResults([])
    setExpandedIndex(null)

    const formData = new FormData()
    formData.append('file', deckFile)
    formData.append('csv_file', csvFile)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rewrite-bulk`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Something went wrong.')
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      const outputs: Record<number, string> = {}
      let done = false

      while (!done) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') { done = true; break }
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'start') {
              outputs[parsed.index] = ''
              setResults(prev => {
                const next = [...prev]
                next[parsed.index] = { company: parsed.company, index: parsed.index, status: 'generating', output: '' }
                return next
              })
              setExpandedIndex(parsed.index)
            } else if (parsed.type === 'text') {
              outputs[parsed.index] = (outputs[parsed.index] ?? '') + parsed.text
              const snapshot = outputs[parsed.index]
              setResults(prev => {
                const next = [...prev]
                if (next[parsed.index]) next[parsed.index] = { ...next[parsed.index], output: snapshot }
                return next
              })
            } else if (parsed.type === 'done') {
              setResults(prev => {
                const next = [...prev]
                if (next[parsed.index]) next[parsed.index] = { ...next[parsed.index], status: 'done' }
                return next
              })
            }
          } catch {}
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSlides = async () => {
    if (!singleOutput) return
    setSlidesLoading(true)
    setSlidesStatus('Starting...')
    setSlidesError('')

    try {
      const formData = new FormData()
      formData.append('deck_content', singleOutput)
      if (deckFile) formData.append('file', deckFile)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/slides`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Something went wrong.')
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'status') {
              setSlidesStatus(parsed.text)
            } else if (parsed.type === 'error') {
              throw new Error(parsed.text)
            } else if (parsed.type === 'file') {
              const bytes = Uint8Array.from(atob(parsed.data), c => c.charCodeAt(0))
              const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = parsed.filename ?? 'sales-deck.pptx'
              a.click()
              URL.revokeObjectURL(url)
            }
          } catch (e) {
            if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
              setSlidesError(e.message)
            }
          }
        }
      }
    } catch (e: unknown) {
      setSlidesError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSlidesLoading(false)
      setSlidesStatus('')
    }
  }

  const copyForGamma = (text: string, key: number | 'single') => {
    navigator.clipboard.writeText(text)
    if (key === 'single') {
      setCopiedSingle(true)
      setTimeout(() => setCopiedSingle(false), 2000)
    } else {
      setCopiedIndex(key)
      setTimeout(() => setCopiedIndex(null), 2000)
    }
  }

  const buttonLabel = () => {
    if (loading) {
      if (statusMessage) return statusMessage
      return mode === 'bulk' ? 'Generating narratives…' : 'Working…'
    }
    if (mode === 'bulk') return 'Generate all narratives'
    return isTailored ? `Personalise for ${companyName}` : 'Rewrite for customers'
  }

  const fileExt = (name: string) => name.split('.').pop()?.toUpperCase() ?? 'FILE'
  const fileSizeMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero (white) ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 pb-16">

        {/* Nav — Granola-style pill */}
        <div className="max-w-4xl mx-auto px-6 pt-5">
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <Logo size={44} />
              <span className="font-bold text-gray-900 text-2xl tracking-tight">PitchFlip</span>
            </div>
            <span className="text-xs text-gray-300 uppercase tracking-widest font-medium">Private beta</span>
          </div>
        </div>

        {/* Headline */}
        <div className="max-w-3xl mx-auto px-6 pt-14 text-center">
          <h1 className="text-5xl font-bold tracking-tight leading-tight text-blue-700 mb-4">
            Turn your investor deck into a<br />
            <span className="text-amber-500">customer sales narrative</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Research-backed. Personalised per prospect. Ready in seconds.
          </p>

          {/* Animated demo */}
          <AnimatedDemo />
        </div>
      </div>

      {/* ── Tool (beige) ──────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Sample decks */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-800 mb-4">Try a sample deck</p>
          <div className="grid grid-cols-2 gap-4">
            {SAMPLE_DECKS.map((sample) => (
              <button
                key={sample.file}
                onClick={() => loadSample(sample)}
                disabled={!!loadingSample}
                className="text-left bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Stacked slides thumbnail area */}
                <div className="relative bg-slate-100 px-5 pt-6 pb-3">
                  {/* Back slides */}
                  <div
                    className="absolute inset-x-5 top-4 bottom-2 rounded-xl bg-blue-200/50 border border-blue-300/30"
                    style={{ transform: 'rotate(4deg) translateY(2px)' }}
                  />
                  <div
                    className="absolute inset-x-5 top-4 bottom-2 rounded-xl bg-blue-100/70 border border-blue-200/40"
                    style={{ transform: 'rotate(2deg) translateY(1px)' }}
                  />
                  {/* Main thumbnail */}
                  <div className="relative z-10 rounded-xl overflow-hidden shadow-md">
                    <img
                      src={sample.thumb}
                      alt={`${sample.company} deck preview`}
                      className="w-full object-cover"
                      style={{ aspectRatio: '16/9' }}
                    />
                    {loadingSample === sample.file && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Loading…</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${sample.sectorColor}`}>
                      {sample.sector}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">{sample.company} Pitch Deck</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Suggested prospect</p>
                    <p className="text-sm font-semibold text-gray-800">{sample.prospect.company} · {sample.prospect.title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main form card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 space-y-6 shadow-sm">

          {/* Mode toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(['single', 'bulk'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {m === 'single' ? 'Single prospect' : 'Multi-prospect'}
              </button>
            ))}
          </div>

          {/* Deck upload */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Your deck</p>
            {deckFile ? (
              <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-blue-700 text-[10px] font-bold tracking-wide">{fileExt(deckFile.name)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-tight truncate">{deckFile.name}</p>
                    <p className="text-xs text-gray-400">{fileSizeMB(deckFile.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeckFile(null)}
                  className="text-gray-300 hover:text-gray-600 transition-colors text-xl leading-none px-1 ml-2 shrink-0"
                  aria-label="Remove file"
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all"
                onClick={() => document.getElementById('deck-input')?.click()}
              >
                <p className="text-gray-400 mb-1">Click to upload PDF or PPTX</p>
                <p className="text-xs text-gray-300">Max 20MB</p>
              </div>
            )}
            <input id="deck-input" type="file" accept=".pdf,.pptx" className="hidden"
              onChange={(e) => setDeckFile(e.target.files?.[0] ?? null)} />
          </div>

          {/* Single prospect fields */}
          {mode === 'single' && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Personalise for a prospect</p>
              <p className="text-xs text-gray-400 mb-3">Leave blank for a generic rewrite</p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Company name (e.g. Stripe)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
                {isTailored && (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Contact job title (e.g. Head of Sales)"
                      value={contactTitle}
                      onChange={(e) => setContactTitle(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Department (e.g. Revenue)"
                      value={contactDepartment}
                      onChange={(e) => setContactDepartment(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Multi-prospect CSV */}
          {mode === 'bulk' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">Prospect list</p>
                  <p className="text-xs text-gray-400">CSV with Customer Name, Contact Name, Job Title — max 30</p>
                </div>
                <button onClick={downloadTemplate} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors">
                  Download template
                </button>
              </div>
              {csvFile ? (
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-blue-700 text-[10px] font-bold tracking-wide">CSV</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 leading-tight">{csvFile.name}</p>
                      <p className="text-xs text-gray-400">{fileSizeMB(csvFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCsvFile(null)}
                    className="text-gray-300 hover:text-gray-600 transition-colors text-xl leading-none px-1 ml-2 shrink-0"
                    aria-label="Remove file"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all"
                  onClick={() => document.getElementById('csv-input')?.click()}
                >
                  <p className="text-gray-400">Click to upload CSV</p>
                </div>
              )}
              <input id="csv-input" type="file" accept=".csv,.xlsx" className="hidden"
                onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} />
            </div>
          )}

          <button
            onClick={mode === 'single' ? handleSingleSubmit : handleBulkSubmit}
            disabled={!deckFile || (mode === 'bulk' && !csvFile) || loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 px-6 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {buttonLabel()}
          </button>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Single output */}
        {mode === 'single' && singleOutput && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Sales Narrative</h2>
                {isTailored && <p className="text-xs text-gray-400 mt-0.5">Personalised for {companyName}</p>}
              </div>
              <div className="flex items-center gap-2">
                {!loading && (
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    {editMode ? 'Done editing' : 'Edit'}
                  </button>
                )}
                <button
                  onClick={() => copyForGamma(singleOutput, 'single')}
                  className="text-sm bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {copiedSingle ? 'Copied!' : 'Copy markdown'}
                </button>
                {!loading && (
                  <span className="text-sm text-gray-400 px-4 py-2">
                    Generate slides <span className="text-xs">(coming soon)</span>
                  </span>
                )}
              </div>
            </div>

            {editMode ? (
              <textarea
                value={singleOutput}
                onChange={(e) => setSingleOutput(e.target.value)}
                className="w-full min-h-[600px] font-mono text-sm text-gray-800 border border-gray-200 rounded-xl p-4 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-y transition-all"
                spellCheck={false}
              />
            ) : (
              <div className="prose prose-gray max-w-none">
                <ReactMarkdown>{singleOutput}</ReactMarkdown>
              </div>
            )}

            {buyerBrief && !loading && (
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-400 mb-3">Want more information on the prospect?</p>
                <button
                  onClick={() => setShowBrief(!showBrief)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2 rounded-lg transition-colors"
                >
                  {showBrief ? 'Hide prospect brief' : 'View prospect brief'}
                </button>
              </div>
            )}
          </div>
        )}


        {/* Buyer brief */}
        {mode === 'single' && showBrief && buyerBrief && (
          <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Prospect Intelligence Brief</h2>
            <p className="text-xs text-gray-400 mb-6">Research compiled for {companyName}</p>
            <div className="prose prose-gray max-w-none">
              <ReactMarkdown>{buyerBrief}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Bulk results */}
        {mode === 'bulk' && results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      result.status === 'done' ? 'bg-emerald-400' :
                      result.status === 'generating' ? 'bg-blue-400 animate-pulse' : 'bg-gray-200'
                    }`} />
                    <span className="font-medium text-gray-900">{result.company}</span>
                    <span className="text-xs text-gray-400">
                      {result.status === 'generating' ? 'Generating…' : result.status === 'done' ? 'Done' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.status === 'done' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); copyForGamma(result.output, i) }}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {copiedIndex === i ? 'Copied!' : 'Copy markdown'}
                      </button>
                    )}
                    <span className="text-gray-300 text-sm ml-1">{expandedIndex === i ? '↑' : '↓'}</span>
                  </div>
                </div>
                {expandedIndex === i && result.output && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    <div className="prose prose-gray max-w-none">
                      <ReactMarkdown>{result.output}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
