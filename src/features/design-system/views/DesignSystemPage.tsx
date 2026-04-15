import React, { useState, useCallback } from 'react'
import { Button, Badge, Card, Tag, IconWithText } from '@components/ui'
import { tokens } from '@design/tokens'
import {
  generatePalette,
  hexToRgbVars,
  applyThemeToSite,
  DEFAULT_BRAND_COLOR,
  THEME_STORAGE_KEY,
} from '@lib/theme'

const PRESETS = [
  { color: '#6B3FA0', label: 'Roxo (padrão)' },
  { color: '#2563EB', label: 'Azul' },
  { color: '#059669', label: 'Verde' },
  { color: '#DC2626', label: 'Vermelho' },
  { color: '#D97706', label: 'Âmbar' },
  { color: '#0891B2', label: 'Ciano' },
  { color: '#7C3AED', label: 'Violeta' },
  { color: '#DB2777', label: 'Rosa' },
]

const SECTIONS = [
  { id: 'cores', label: 'Cores' },
  { id: 'tipografia', label: 'Tipografia' },
  { id: 'componentes', label: 'Componentes' },
  { id: 'layout', label: 'Layout' },
]

// ── Componente principal ────────────────────────────────────────────────────

function DesignSystemPage() {
  const initial = localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_BRAND_COLOR
  const [brandColor, setBrandColor] = useState(initial)
  const [hexInput, setHexInput] = useState(initial)
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState('cores')

  const palette = generatePalette(brandColor)

  const handleColorChange = (hex: string) => {
    setBrandColor(hex)
    setHexInput(hex)
    applyThemeToSite(hex)
  }

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexInput(val)
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setBrandColor(val)
      applyThemeToSite(val)
    }
  }

  const copyTailwindConfig = useCallback(() => {
    localStorage.setItem(THEME_STORAGE_KEY, brandColor)
    const cssVars = `/* Cole em src/index.css dentro de :root */
  --color-brand-50:  ${hexToRgbVars(palette['50']  ?? '')};
  --color-brand-100: ${hexToRgbVars(palette['100'] ?? '')};
  --color-brand-200: ${hexToRgbVars(palette['200'] ?? '')};
  --color-brand-300: ${hexToRgbVars(palette['300'] ?? '')};
  --color-brand-400: ${hexToRgbVars(palette['400'] ?? '')};
  --color-brand:     ${hexToRgbVars(palette['500'] ?? '')};   /* 500 / DEFAULT */
  --color-brand-600: ${hexToRgbVars(palette['600'] ?? '')};
  --color-brand-700: ${hexToRgbVars(palette['700'] ?? '')};
  --color-brand-800: ${hexToRgbVars(palette['800'] ?? '')};
  --color-brand-900: ${hexToRgbVars(palette['900'] ?? '')};
  --color-brand-950: ${hexToRgbVars(palette['950'] ?? '')};`
    navigator.clipboard.writeText(cssVars)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }, [brandColor, palette])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(id)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: brandColor }} />
              <div>
                <h1 className="text-xl font-bold text-neutral-900">Design System</h1>
                <p className="text-xs text-neutral-400">A2Tech · React + TypeScript + Tailwind</p>
              </div>
            </div>
            <Badge variant="neutral">v1.0.0</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-24 space-y-4">

              {/* Navigation */}
              <Card padding="sm">
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Seções
                </p>
                <nav className="space-y-0.5">
                  {SECTIONS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-150 ${
                        activeSection !== s.id ? 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900' : ''
                      }`}
                      style={
                        activeSection === s.id
                          ? { backgroundColor: brandColor, color: 'white' }
                          : {}
                      }
                    >
                      {s.label}
                    </button>
                  ))}
                </nav>
              </Card>

              {/* Customization Panel */}
              <Card padding="md">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Personalizar Tema
                </p>

                <div className="space-y-4">
                  {/* Color picker */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                      Cor Principal
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="relative cursor-pointer">
                        <div
                          className="h-9 w-9 rounded-lg border-2 border-neutral-200 shadow-sm transition-shadow hover:shadow-md"
                          style={{ backgroundColor: brandColor }}
                        />
                        <input
                          type="color"
                          value={brandColor}
                          onChange={e => handleColorChange(e.target.value)}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                      </label>
                      <input
                        type="text"
                        value={hexInput}
                        onChange={handleHexInput}
                        maxLength={7}
                        className="w-full rounded-lg border border-neutral-200 px-2 py-1.5 font-mono text-xs focus:outline-none focus:ring-2"
                        style={{ focusRingColor: brandColor } as React.CSSProperties}
                        placeholder="#6B3FA0"
                      />
                    </div>
                  </div>

                  {/* Palette strip */}
                  <div>
                    <p className="mb-1.5 text-[10px] text-neutral-400">Paleta gerada</p>
                    <div className="flex overflow-hidden rounded-lg">
                      {Object.entries(palette).map(([key, color]) => (
                        <div
                          key={key}
                          className="h-7 flex-1 cursor-pointer transition-transform hover:scale-y-125"
                          style={{ backgroundColor: color }}
                          title={`${key}: ${color}`}
                        />
                      ))}
                    </div>
                    <div className="mt-0.5 flex justify-between font-mono text-[9px] text-neutral-400">
                      <span>50</span><span>950</span>
                    </div>
                  </div>

                  {/* Presets */}
                  <div>
                    <p className="mb-2 text-[10px] text-neutral-400">Presets</p>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESETS.map(({ color, label }) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          title={label}
                          className="h-6 w-6 rounded-full transition-transform hover:scale-110"
                          style={{
                            backgroundColor: color,
                            outline: brandColor === color ? `2px solid ${color}` : 'none',
                            outlineOffset: '2px',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Copy config */}
                  <button
                    onClick={copyTailwindConfig}
                    className="w-full rounded-lg py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: copied ? '#10B981' : brandColor }}
                  >
                    {copied ? '✓ Copiado!' : 'Salvar permanentemente'}
                  </button>
                </div>
              </Card>
            </div>
          </aside>

          {/* ── Content ─────────────────────────────────────────────────── */}
          <main className="min-w-0 flex-1 space-y-16">

            {/* Mobile nav */}
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                  style={
                    activeSection === s.id
                      ? { backgroundColor: brandColor, color: 'white' }
                      : { backgroundColor: 'white', color: '#374151', border: '1px solid #E5E7EB' }
                  }
                >
                  {s.label}
                </button>
              ))}
            </nav>

            {/* ── CORES ──────────────────────────────────────────────────── */}
            <section id="cores">
              <SectionTitle color={brandColor}>Cores</SectionTitle>

              {/* Brand palette */}
              <div className="mb-8">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-700">Paleta da Marca</h3>
                  <span className="font-mono text-xs text-neutral-400">{brandColor}</span>
                </div>
                <div className="grid grid-cols-6 overflow-hidden rounded-2xl shadow-sm sm:grid-cols-11">
                  {Object.entries(palette).map(([key, color]) => (
                    <div key={key}>
                      <div className="h-16 sm:h-20" style={{ backgroundColor: color }} />
                      <div className="bg-white px-0.5 py-1.5 text-center">
                        <p className="text-[9px] font-medium text-neutral-400">{key}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* State colors */}
              <div className="mb-8">
                <h3 className="mb-3 font-semibold text-neutral-700">Cores de Estado</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {(['success', 'error', 'warning', 'info'] as const).map(state => {
                    const sc = tokens.colors[state]
                    return (
                      <div key={state} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                        <div className="h-12" style={{ backgroundColor: sc.DEFAULT }} />
                        <div className="p-3">
                          <p className="mb-2 text-sm font-semibold capitalize text-neutral-800">{state}</p>
                          {Object.entries(sc).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-2 py-0.5">
                              <div className="h-4 w-4 rounded" style={{ backgroundColor: v as string }} />
                              <span className="font-mono text-[10px] text-neutral-400">{v as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Neutrals */}
              <div>
                <h3 className="mb-3 font-semibold text-neutral-700">Tons Neutros</h3>
                <div className="grid grid-cols-6 overflow-hidden rounded-2xl shadow-sm sm:grid-cols-11">
                  {Object.entries(tokens.colors.neutral).map(([key, value]) => (
                    <div key={key}>
                      <div className="h-16 border-r border-neutral-50 sm:h-20" style={{ backgroundColor: value }} />
                      <div className="bg-white px-0.5 py-1.5 text-center">
                        <p className="text-[9px] font-medium text-neutral-400">{key}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── TIPOGRAFIA ─────────────────────────────────────────────── */}
            <section id="tipografia">
              <SectionTitle color={brandColor}>Tipografia</SectionTitle>

              <Card padding="lg">
                <div className="divide-y divide-neutral-100">
                  <TypoRow label="Heading 1" spec="2.5rem / 700"><h1>Heading 1</h1></TypoRow>
                  <TypoRow label="Heading 2" spec="2rem / 700"><h2>Heading 2</h2></TypoRow>
                  <TypoRow label="Heading 3" spec="1.75rem / 600"><h3>Heading 3</h3></TypoRow>
                  <TypoRow label="Heading 4" spec="1.5rem / 600"><h4>Heading 4</h4></TypoRow>
                  <TypoRow label="Heading 5" spec="1.25rem / 600"><h5>Heading 5</h5></TypoRow>
                  <TypoRow label="Heading 6" spec="1.125rem / 600"><h6>Heading 6</h6></TypoRow>
                  <TypoRow label="Body Large" spec="1.125rem / 400">
                    <p className="text-body-lg">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  </TypoRow>
                  <TypoRow label="Body" spec="1rem / 400">
                    <p className="text-body">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  </TypoRow>
                  <TypoRow label="Body Small" spec="0.875rem / 400">
                    <p className="text-body-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  </TypoRow>
                  <TypoRow label="Caption" spec="0.75rem / 400">
                    <p className="text-caption">Lorem ipsum dolor sit amet.</p>
                  </TypoRow>
                </div>
              </Card>
            </section>

            {/* ── COMPONENTES ────────────────────────────────────────────── */}
            <section id="componentes">
              <SectionTitle color={brandColor}>Componentes</SectionTitle>

              {/* Buttons */}
              <ComponentBlock title="Botões">
                <ComponentRow label="Variantes">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                </ComponentRow>
                <ComponentRow label="Tamanhos">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </ComponentRow>
                <ComponentRow label="Estados">
                  <div className="flex flex-wrap gap-3">
                    <Button>Normal</Button>
                    <Button disabled>Disabled</Button>
                    <Button isLoading>Loading</Button>
                  </div>
                </ComponentRow>
                <ComponentRow label="Full Width">
                  <Button fullWidth>Full Width Button</Button>
                </ComponentRow>
              </ComponentBlock>

              {/* Badges */}
              <ComponentBlock title="Badges">
                <ComponentRow label="Variantes">
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="error">Error</Badge>
                    <Badge variant="info">Info</Badge>
                    <Badge variant="neutral">Neutral</Badge>
                  </div>
                </ComponentRow>
                <ComponentRow label="Tamanhos">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge size="sm">Small</Badge>
                    <Badge size="md">Medium</Badge>
                    <Badge size="lg">Large</Badge>
                  </div>
                </ComponentRow>
                <ComponentRow label="Uso real">
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="primary">MAIS VENDIDO</Badge>
                    <Badge variant="warning">PROMOÇÃO</Badge>
                    <Badge variant="success">EM ESTOQUE</Badge>
                    <Badge variant="error">ESGOTADO</Badge>
                  </div>
                </ComponentRow>
              </ComponentBlock>

              {/* Tags */}
              <ComponentBlock title="Tags">
                <ComponentRow label="Variantes">
                  <div className="flex flex-wrap gap-3">
                    <Tag variant="success">Frete Grátis</Tag>
                    <Tag variant="info">12x sem juros</Tag>
                    <Tag variant="warning">Últimas unidades</Tag>
                    <Tag variant="neutral">Certificado ISO</Tag>
                  </div>
                </ComponentRow>
              </ComponentBlock>

              {/* Cards */}
              <ComponentBlock title="Cards">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <h4 className="mb-2">Card Padrão</h4>
                    <p className="text-sm text-neutral-500">Padding médio, shadow padrão.</p>
                  </Card>
                  <Card hover>
                    <h4 className="mb-2">Card Hover</h4>
                    <p className="text-sm text-neutral-500">Passe o mouse para ver o efeito.</p>
                  </Card>
                  <Card padding="lg">
                    <h4 className="mb-2">Card Large</h4>
                    <p className="text-sm text-neutral-500">Com padding grande.</p>
                  </Card>
                </div>
              </ComponentBlock>

              {/* IconWithText */}
              <ComponentBlock title="Icon With Text">
                <div className="grid gap-6 md:grid-cols-2">
                  <IconWithText
                    icon={<svg fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" /></svg>}
                    title="Nossa Missão"
                    description="Fornecer soluções industriais de alta qualidade."
                  />
                  <IconWithText
                    icon={<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    title="Certificações"
                    description="ISO 9001 e ABNT para garantia de qualidade."
                  />
                </div>
              </ComponentBlock>
            </section>

            {/* ── LAYOUT ─────────────────────────────────────────────────── */}
            <section id="layout">
              <SectionTitle color={brandColor}>Layout & Espaçamento</SectionTitle>

              <Card padding="lg">
                <div className="space-y-10">

                  {/* Spacing */}
                  <div>
                    <h3 className="mb-4 font-semibold text-neutral-700">Espaçamentos</h3>
                    <div className="space-y-2">
                      {Object.entries(tokens.spacing).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-4">
                          <div
                            className="h-7 rounded"
                            style={{ width: value, backgroundColor: brandColor, opacity: 0.6 }}
                          />
                          <span className="font-mono text-sm text-neutral-500">
                            <span className="font-semibold text-neutral-700">{key}</span> · {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Border Radius */}
                  <div>
                    <h3 className="mb-4 font-semibold text-neutral-700">Border Radius</h3>
                    <div className="flex flex-wrap gap-5">
                      {Object.entries(tokens.borderRadius).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div
                            className="mb-2 h-16 w-16 opacity-70"
                            style={{ borderRadius: value, backgroundColor: brandColor }}
                          />
                          <p className="font-mono text-[10px] font-medium text-neutral-600">{key}</p>
                          <p className="font-mono text-[9px] text-neutral-400">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shadows */}
                  <div>
                    <h3 className="mb-4 font-semibold text-neutral-700">Sombras</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      {Object.entries(tokens.shadows).map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-xl bg-white p-4"
                          style={{ boxShadow: value }}
                        >
                          <p className="font-mono text-sm font-medium text-neutral-600">{key}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </Card>
            </section>

          </main>
        </div>
      </div>
    </div>
  )
}

// ── Sub-componentes ─────────────────────────────────────────────────────────

function SectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="h-6 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <h2 className="text-2xl font-bold text-neutral-900">{children}</h2>
    </div>
  )
}

function TypoRow({ children, label, spec }: { children: React.ReactNode; label: string; spec: string }) {
  return (
    <div className="flex items-start gap-4 py-5">
      <div className="w-28 shrink-0 pt-1">
        <p className="text-xs font-semibold text-neutral-400">{label}</p>
        <p className="font-mono text-[10px] text-neutral-300">{spec}</p>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function ComponentBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 font-semibold text-neutral-700">{title}</h3>
      <Card padding="lg">
        <div className="space-y-6">{children}</div>
      </Card>
    </div>
  )
}

function ComponentRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
      {children}
    </div>
  )
}

export default DesignSystemPage
