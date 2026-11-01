import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Crown, Pause, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  { src: '/images/udaipur_palace_night.jpg', alt: 'Udaipur palace illuminated for an evening celebration', location: 'Udaipur · Rajasthan' },
  { src: '/images/royal_mandap_decor.jpg', alt: 'Floral mandap prepared for a palace wedding', location: 'Jaipur · Rajasthan' },
  { src: '/images/royal_couple_palace.jpg', alt: 'A couple celebrating at a heritage palace', location: 'Heritage celebrations' },
  { src: '/images/royal_banquet_feast.jpg', alt: 'A candlelit wedding banquet with traditional decor', location: 'Wedding experiences' },
];

export const WeddingHero: React.FC = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const showSlide = (direction: -1 | 1) => {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <section
      aria-label="Royal Knot wedding portfolio"
      className="relative isolate min-h-[300px] overflow-hidden rounded-[1.75rem] border border-gold-400/50 bg-navy-900 shadow-luxury-lg sm:min-h-[350px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        if (startX !== null && endX !== undefined && Math.abs(startX - endX) > 48) {
          showSlide(startX > endX ? 1 : -1);
        }
        touchStartX.current = null;
      }}
    >
      {slides.map((slide, index) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          loading={index === 0 ? 'eager' : 'lazy'}
          onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={index !== activeSlide}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/75 to-navy-950/20 sm:to-navy-950/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-transparent to-navy-950/10" />

      <div className="relative z-10 flex min-h-[300px] flex-col justify-center px-6 py-8 sm:min-h-[350px] sm:px-10 lg:px-14">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-300/50 bg-navy-950/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-200">
            <Crown className="h-3.5 w-3.5 text-gold-300" />
            The Royal Knot · {slides[activeSlide].location}
          </div>
          <h1 className="font-serif text-3xl font-semibold leading-[1.08] tracking-tight text-ivory-50 sm:text-5xl lg:text-6xl">
            Every Celebration
            <br />
            Begins With a
            <br />
            <span className="text-gold-300">Beautiful Story...</span>
          </h1>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.25em] text-gold-100 sm:text-sm">
            Plan <span className="px-1 text-gold-400">·</span> Organize <span className="px-1 text-gold-400">·</span> Celebrate
          </p>
          <button
            type="button"
            onClick={() => navigate('/weddings')}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold-300 px-5 py-2.5 text-xs font-semibold text-gold-100 transition-colors hover:bg-gold-400 hover:text-navy-950"
          >
            Explore wedding portfolio
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 sm:bottom-6 sm:right-8">
        <button
          type="button"
          aria-label={isPaused ? 'Resume automatic slides' : 'Pause automatic slides'}
          onClick={() => setIsPaused((paused) => !paused)}
          className="rounded-full border border-white/30 bg-navy-950/45 p-2 text-gold-100 backdrop-blur transition-colors hover:bg-navy-950/75"
        >
          {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => showSlide(-1)}
          aria-label="Previous wedding photograph"
          className="rounded-full border border-white/30 bg-navy-950/45 p-2 text-gold-100 backdrop-blur transition-colors hover:bg-navy-950/75"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => showSlide(1)}
          aria-label="Next wedding photograph"
          className="rounded-full border border-white/30 bg-navy-950/45 p-2 text-gold-100 backdrop-blur transition-colors hover:bg-navy-950/75"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="ml-1 flex items-center gap-1.5" aria-label="Choose a wedding photograph">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Show photograph ${index + 1}`}
              aria-current={index === activeSlide}
              className={`h-1.5 rounded-full transition-all ${index === activeSlide ? 'w-6 bg-gold-300' : 'w-1.5 bg-ivory-50/70 hover:bg-gold-200'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
