import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getResources } from '../api/resources'
import { getMyBookings } from '../api/bookings'
import { getMyTickets } from '../api/tickets'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'


gsap.registerPlugin(ScrollTrigger)

/* ── Carousel slides ── */
const SLIDES = [
  {
    image: '/images/slider/slide-1.png',
    accent: '#2563eb', // Corporate Blue
    tag: 'Facilities',
    headline: 'Browse & Book\nCampus Resources',
    sub: 'Lecture halls, labs, meeting rooms and equipment — all in one place.',
    cta: { label: 'Browse Resources', to: '/resources' },
    cta2: { label: 'New Booking', to: '/bookings/new' },
  },
  {
    image: '/images/slider/slide-2.png',
    accent: '#0f172a', // Navy
    tag: 'Tickets',
    headline: 'Report Issues &\nTrack Every Fix',
    sub: 'Submit maintenance tickets, attach photos, and watch technicians resolve them in real time.',
    cta: { label: 'Report an Issue', to: '/tickets/new' },
    cta2: { label: 'My Tickets', to: '/tickets/my' },
  },
  {
    image: '/images/slider/slide-3.png',
    accent: '#10b981', // Success green
    tag: 'Bookings',
    headline: 'Manage All Your\nBookings Easily',
    sub: 'View pending, approved and upcoming bookings. Cancel or rebook in seconds.',
    cta: { label: 'My Bookings', to: '/bookings/my' },
    cta2: { label: 'New Booking', to: '/bookings/new' },
  },
]


export default function DashboardPage() {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState({ resources: 0, bookings: 0, tickets: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [active, setActive] = useState(0)
  
  // Refs for tracking elements
  const textContainerRef = useRef(null)
  const bgRefs = useRef([])
  const featureRefs = useRef([])

  useEffect(() => {
    Promise.allSettled([getResources(), getMyBookings(), getMyTickets()])
      .then(([r, b, t]) => setStats({
        resources: r.value?.data?.length ?? 0,
        bookings:  b.value?.data?.length ?? 0,
        tickets:   t.value?.data?.length ?? 0,
      }))
      .finally(() => setStatsLoading(false))
  }, [])

  // Initialize smooth scrolling and scroll trigger animations
  useEffect(() => {
    // Feature Scroll Animations
    featureRefs.current.forEach((ref) => {
      if (!ref) return
      gsap.fromTo(ref, 
        { y: 60, autoAlpha: 0 }, 
        { 
          y: 0, 
          autoAlpha: 1, 
          duration: 1, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref,
            start: 'top 85%',
          }
        }
      )
    })

    return () => {
      setTimeout(() => ScrollTrigger.refresh(), 0)
    }
  }, [])

  // Animate background crossfade
  useEffect(() => {
    bgRefs.current.forEach((bg, index) => {
      if (!bg) return
      if (index === active) {
        gsap.to(bg, { autoAlpha: 1, duration: 1, ease: 'power2.inOut' })
        gsap.to(bg, { scale: 1, duration: 6, ease: 'none', overwrite: 'auto' }) 
      } else {
        gsap.to(bg, { autoAlpha: 0, duration: 1, ease: 'power2.inOut' })
        gsap.set(bg, { scale: 1.05 }) 
      }
    })
  }, [active])

  // Animate text overlay
  useEffect(() => {
    if (!textContainerRef.current) return
    const elements = textContainerRef.current.querySelectorAll('.gsap-anim')
    const tl = gsap.timeline()
    gsap.set(elements, { y: 20, autoAlpha: 0 })
    tl.to(elements, {
      y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out'
    }, "+=0.1")
    return () => tl.kill()
  }, [active])

  const slide = SLIDES[active]
  const statCards = [
    { icon: '🏢', value: stats.resources, label: 'Resources', to: '/resources', color: '#0f172a' },
    { icon: '📅', value: stats.bookings,  label: 'Bookings',  to: '/bookings/my', color: '#0f172a' },
    { icon: '🎫', value: stats.tickets,   label: 'Tickets',   to: '/tickets/my',  color: '#0f172a' },
  ]

  const addToFeatureRefs = el => { if (el && !featureRefs.current.includes(el)) featureRefs.current.push(el); }

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#111827', minHeight: '100vh', paddingBottom: 100 }}>
      {/* ── 100VH Hero Landing Showcase ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        height: '100vh',
      }}>
        {/* Background images */}
        {SLIDES.map((s, i) => (
          <div 
            key={i}
            ref={el => bgRefs.current[i] = el}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${s.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === 0 ? 1 : 0,
              visibility: i === 0 ? 'visible' : 'hidden',
              transform: 'scale(1.05)'
            }}
          />
        ))}

        {/* Corporate dim overlay for bright hero readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.6) 40%, rgba(15,23,42,0.2) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Dynamic Inner Container */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 40, padding: '0 8%', height: '100%', maxWidth: 1600, margin: '0 auto' }}>
          
          {/* Left Column (Text & Thumbnails) */}
          <div style={{ flex: '1 1 50%', maxWidth: 540, display: 'flex', flexDirection: 'column', paddingTop: 60 }}>
            
            <div ref={textContainerRef} key={`text-${active}`}>
              {/* Tag */}
              <div className="gsap-anim" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.15)', border: `1px solid rgba(255,255,255,0.3)`,
                borderRadius: 20, padding: '4px 12px', marginBottom: 16,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: slide.accent === '#0f172a' ? '#3b82f6' : slide.accent }} />
                <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase' }}>{slide.tag}</span>
              </div>

              {/* Headline */}
              <h1 className="gsap-anim" style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(42px, 4.5vw, 64px)', fontWeight: 700, color: '#fff',
                lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16,
                whiteSpace: 'pre-line'
              }}>
                {slide.headline}
              </h1>

              {/* Sub */}
              <p className="gsap-anim" style={{
                fontSize: 18, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6,
                margin: 0, marginBottom: 40, maxWidth: '90%', fontWeight: 300
              }}>
                {slide.sub}
              </p>

              {/* Buttons */}
              <div className="gsap-anim" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to={slide.cta.to} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 28px', background: slide.accent === '#0f172a' ? '#2563eb' : slide.accent, color: '#fff',
                  fontWeight: 600, fontSize: 14, borderRadius: 8,
                  textDecoration: 'none', boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
                  transition: 'transform 0.2s'
                }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                  {slide.cta.label}
                </Link>
                <Link to={slide.cta2.to} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 24px', background: '#ffffff',
                  border: '1px solid #e2e8f0', color: '#111827',
                  fontWeight: 600, fontSize: 14, borderRadius: 8,
                  textDecoration: 'none', transition: 'background 0.2s'
                }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = '#ffffff'}>
                  {slide.cta2.label}
                </Link>
              </div>
            </div>

            {/* Thumbnails */}
            <div style={{ display: 'flex', gap: 14, marginTop: 48 }}>
              {SLIDES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  style={{
                    width: 100, height: 60, borderRadius: 10, border: 'none',
                    padding: 0, cursor: 'pointer', overflow: 'hidden',
                    position: 'relative',
                    boxShadow: i === active ? `0 0 0 2px #ffffff` : '0 4px 12px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: i === active ? 1 : 0.5,
                    transform: i === active ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${s.image})`,
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }} />
                  {i !== active && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', transition: 'background-color 0.3s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(15,23,42,0.2)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(15,23,42,0.5)'} />}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* ── Seamless Scrolling Metrics / Quick Link Ribbon ── */}
      <div style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '32px 8%' }} ref={addToFeatureRefs}>
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 40 }}>
          <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
            {statCards.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>
                    {statsLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : s.value}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {isAdmin() ? (
              <Link to="/admin" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>⚙️ Enter Admin</Link>
            ) : (
              <Link to="/resources" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>Explore Space</Link>
            )}
            <Link to="/tickets/new" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: 14 }}>Report Issue</Link>
          </div>
        </div>
      </div>

      {/* ── Feature Section 1: Campus Real Estate ── */}
      <div style={{ padding: '100px 8%', maxWidth: 1600, margin: '0 auto', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8%', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 40%', minWidth: 320 }} ref={addToFeatureRefs}>
            <div style={{ color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', fontSize: 13, marginBottom: 16 }}>Capacity Management</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 24, letterSpacing: '-0.02em', color: '#0f172a' }}>Book Smart Workspaces Dynamically</h2>
            <p style={{ color: '#4b5563', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
              Stop guessing if the lecture hall is available. Our intuitive corporate grid dynamically tracks capacity, technical equipment, and schedules natively. Plan ahead for massive seminars or grab a quick focus booth.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Live capacity tracking', 'Modern floor-map integrations', 'Automated approval routing'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1f2937', fontSize: 15, fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', fontSize: 12 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: '1 1 50%', minWidth: 320, position: 'relative' }} ref={addToFeatureRefs}>
            <img 
              src="/images/website/resource-booking.png" 
              alt="Holographic resource booking interface" 
              style={{ width: '100%', borderRadius: 16, boxShadow: '0 20px 40px rgba(15,23,42,0.1)', border: '1px solid #e2e8f0', position: 'relative', zIndex: 1 }} 
            />
          </div>
        </div>
      </div>

      {/* ── Feature Section 2: Technician Maintenance ── */}
      <div style={{ padding: '80px 8% 120px', maxWidth: 1600, margin: '0 auto', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8%', flexWrap: 'wrap-reverse' }}>
          <div style={{ flex: '1 1 50%', minWidth: 320, position: 'relative' }} ref={addToFeatureRefs}>
            <img 
              src="/images/website/maintenance-tech.png" 
              alt="Maintenance ticketing and analytics" 
              style={{ width: '100%', borderRadius: 16, boxShadow: '0 20px 40px rgba(15,23,42,0.1)', border: '1px solid #e2e8f0', position: 'relative', zIndex: 1 }} 
            />
          </div>
          <div style={{ flex: '1 1 40%', minWidth: 320 }} ref={addToFeatureRefs}>
            <div style={{ color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', fontSize: 13, marginBottom: 16 }}>Operational Uptime</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 24, letterSpacing: '-0.02em', color: '#0f172a' }}>Keep The Organization Running smoothly</h2>
            <p style={{ color: '#4b5563', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
              A broken projector shouldn't halt a critical meeting. Report incidents globally across the application and immediately alert dispatch teams with priority escalations. Precise corporate oversight from report to resolution.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Attach diagnostics imagery', 'Direct technician assignment', 'Service level agreements analytics'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1f2937', fontSize: 15, fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', fontSize: 12 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  )
}
