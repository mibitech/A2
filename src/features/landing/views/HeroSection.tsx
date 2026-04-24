import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button, Badge } from '@components/ui'
import { getHeroSlides } from '@features/admin/services/site.admin.service'
import type { HeroSlide } from '@features/admin/services/site.admin.service'

const SLIDES_FALLBACK: HeroSlide[] = [
  {
    id: '1',
    titulo: 'Cintas de Elevação',
    subtitulo: 'Frete Grátis para todo Brasil',
    badge: 'FRETE GRÁTIS',
    ctaTexto: 'Comprar Agora',
    ctaUrl: '/produtos',
    imagemUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=600&fit=crop',
    ordem: 0,
    ativo: true,
    createdAt: '',
  },
  {
    id: '2',
    titulo: 'Cabos de Aço',
    subtitulo: 'Qualidade certificada ISO 9001',
    badge: 'CERTIFICADO',
    ctaTexto: 'Ver Produtos',
    ctaUrl: '/produtos',
    imagemUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&h=600&fit=crop',
    ordem: 1,
    ativo: true,
    createdAt: '',
  },
  {
    id: '3',
    titulo: 'Amarração de Cargas',
    subtitulo: 'Até 12x sem juros',
    badge: '12X SEM JUROS',
    ctaTexto: 'Comprar Agora',
    ctaUrl: '/produtos',
    imagemUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1200&h=600&fit=crop',
    ordem: 2,
    ativo: true,
    createdAt: '',
  },
]

const AUTO_PLAY_INTERVAL = 5000

function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>(SLIDES_FALLBACK)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    getHeroSlides().then(({ slides: data }) => {
      const ativos = data.filter(s => s.ativo)
      if (ativos.length > 0) setSlides(ativos)
    })
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => setCurrentSlide(index)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(nextSlide, AUTO_PLAY_INTERVAL)
    return () => clearInterval(timer)
  }, [slides.length, nextSlide])

  const slide = slides[currentSlide]

  return (
    <section className="relative h-[280px] overflow-hidden bg-neutral-900 sm:h-[380px] md:h-[460px] lg:h-[520px]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${slide?.imagemUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
      </div>

      {/* Content */}
      <div className="container relative mx-auto h-full px-4">
        <div className="flex h-full items-center">
          <div className="max-w-xl">
            {slide?.badge && (
              <Badge variant="primary" size="md" className="mb-4">
                {slide.badge}
              </Badge>
            )}
            <h2 className="mb-2 text-xl font-bold text-white sm:mb-4 sm:text-2xl md:text-3xl lg:text-4xl">
              {slide?.titulo}
            </h2>
            <p className="mb-4 text-sm text-white sm:mb-6 sm:text-base md:text-xl">
              {slide?.subtitulo}
            </p>
            <Link to={slide?.ctaUrl ?? '/produtos'}>
              <Button size="lg" variant="primary" className="text-sm sm:text-base">
                {slide?.ctaTexto}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30 sm:left-4 sm:p-3"
            aria-label="Slide anterior"
          >
            <svg className="h-4 w-4 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30 sm:right-4 sm:p-3"
            aria-label="Próximo slide"
          >
            <svg className="h-4 w-4 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-brand' : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default HeroSection
