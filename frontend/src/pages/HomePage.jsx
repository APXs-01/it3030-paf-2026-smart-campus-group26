// Shared: Landing page (public route)
// Branch: feature/facilities-inventory-ui
import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ── Carousel slides ── */
const SLIDES = [
  {
    tag: 'Facilities Management',
    title: 'Book Any Campus\nSpace Instantly',
    desc: 'Lecture halls, labs, meeting rooms and equipment — browse, filter and reserve in seconds with automatic conflict detection.',
    accent: '#6366f1',
    accent2: '#8b5cf6',
    bg: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%)',
    image: '/images/website/resource-booking.png',
  },
  {
    tag: 'Incident Ticketing',
    title: 'Report Issues,\nTrack Every Fix',
    desc: 'Submit maintenance tickets with photo attachments. Follow status updates from OPEN to RESOLVED in real time.',
    accent: '#06b6d4',
    accent2: '#0ea5e9',
    bg: 'linear-gradient(135deg,#0c4a6e 0%,#075985 50%,#0369a1 100%)',
    image: '/images/website/maintenance-tech.png',
  },
  {
    tag: 'Live Notifications',
    title: 'Stay Informed\nEvery Step',
    desc: 'Get instant alerts for booking approvals, ticket updates, and comments — with full control over what you receive.',
    accent: '#10b981',
    accent2: '#059669',
    bg: 'linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%)',
    image: '/images/website/homepage-notif.png',
  },
  {
    tag: 'Role-Based Access',
    title: 'Secure Access\nFor Everyone',
    desc: 'OAuth 2.0 Google sign-in with role-based permissions. Admins, technicians, and users each see exactly what they need.',
    accent: '#f59e0b',
    accent2: '#d97706',
    bg: 'linear-gradient(135deg,#451a03 0%,#78350f 50%,#92400e 100%)',
    image: '/images/website/homepage-oauth.png',
  },
]

const FEATURES = [
  { icon: '🏢', title: 'Facilities & Resources', desc: 'Browse lecture halls, labs, meeting rooms, and equipment in a unified smart catalogue.' },
  { icon: '📅', title: 'Smart Bookings', desc: 'Reserve resources instantly with automatic conflict detection — no double-bookings, ever.' },
  { icon: '🎫', title: 'Incident Ticketing', desc: 'Report issues with photo attachments and track repairs through a full technician workflow.' },
  { icon: '🔔', title: 'Live Notifications', desc: 'Get real-time alerts for booking approvals, ticket status changes, and admin comments.' },
  { icon: '🔐', title: 'Google OAuth', desc: 'Secure single sign-on with your Google account. No passwords — just one tap.' },
  { icon: '🛡️', title: 'Role-Based Access', desc: 'Admins, technicians, and users each see exactly what they need — nothing more.' },
]

export default function HomePage() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)
  const slide = SLIDES[active]

  const goTo = (i) => { setActive(i); setPaused(true); setTimeout(() => setPaused(false), 6000) }
  const prev = () => goTo((active - 1 + SLIDES.length) % SLIDES.length)
  const next = () => goTo((active + 1) % SLIDES.length)

  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(() => setActive(a => (a + 1) % SLIDES.length), 5000)
    return () => clearInterval(intervalRef.current)
  }, [paused])

  useEffect(() => {
    // Reveal Features
    gsap.fromTo('.home-card', 
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.home-features',
          start: 'top 80%',
        }
      }
    )

    // Reveal CTA
    gsap.fromTo('.home-cta',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.home-cta',
          start: 'top 85%',
        }
      }
    )
  }, [])


  return (
    <div className="home-page">
      {/* ── Hero carousel ── */}
      <header style={{ position: 'relative', overflow: 'hidden', background: slide.bg, transition: 'background 0.7s ease', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Animated blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: slide.accent + '18', filter: 'blur(80px)', top: '-100px', left: '-100px', transition: 'background 0.7s' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: slide.accent2 + '14', filter: 'blur(60px)', bottom: '-80px', right: '-60px', transition: 'background 0.7s' }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', filter: 'blur(30px)', top: '40%', left: '40%' }} />
        </div>

        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Nav bar inside hero */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏫</div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>SmartCampus</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/resources" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', textDecoration: 'none', transition: 'background 0.15s' }}>
              Resources
            </Link>
            <Link to="/login" style={{ color: '#fff', fontSize: 13, fontWeight: 700, padding: '7px 18px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', textDecoration: 'none', backdropFilter: 'blur(4px)' }}>
              Sign In →
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 2, padding: '0 40px 60px', maxWidth: 1200, margin: '0 auto', width: '100%', gap: 60 }}>

          {/* Left: text */}
          <div style={{ flex: '0 0 480px', maxWidth: 480 }} key={active}>
            {/* Tag pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: slide.accent + '22', border: `1px solid ${slide.accent}44`,
              borderRadius: 20, padding: '5px 14px', marginBottom: 24,
              animation: 'fadeSlideIn 0.5s ease both',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: slide.accent }} />
              <span style={{ color: slide.accent, fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>{slide.tag}</span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#fff',
              lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20,
              whiteSpace: 'pre-line', animation: 'fadeSlideIn 0.5s ease 0.05s both',
            }}>
              {slide.title}
            </h1>

            {/* Desc */}
            <p style={{
              fontSize: 16, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7,
              marginBottom: 36, animation: 'fadeSlideIn 0.5s ease 0.1s both',
            }}>
              {slide.desc}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeSlideIn 0.5s ease 0.15s both' }}>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', background: '#fff', color: '#1e1b4b',
                fontWeight: 800, fontSize: 14, borderRadius: 10, textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25)', transition: 'all 0.18s',
              }}>
                Get Started →
              </Link>
              <Link to="/resources" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 24px', background: 'rgba(255,255,255,0.1)',
                border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff',
                fontWeight: 600, fontSize: 14, borderRadius: 10, textDecoration: 'none',
                backdropFilter: 'blur(4px)', transition: 'all 0.18s',
              }}>
                Browse Resources
              </Link>
            </div>

            {/* Slide indicators */}
            <div style={{ display: 'flex', gap: 8, marginTop: 40, alignItems: 'center' }}>
              {SLIDES.map((_s, i) => (
                <button key={i} onClick={() => goTo(i)} style={{
                  height: 4, borderRadius: 2, border: 'none', cursor: 'pointer',
                  background: i === active ? '#fff' : 'rgba(255,255,255,0.25)',
                  width: i === active ? 32 : 12,
                  transition: 'all 0.3s', padding: 0,
                }} />
              ))}
              <div style={{ marginLeft: 12, display: 'flex', gap: 6 }}>
                <button onClick={prev} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                <button onClick={next} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
              </div>
            </div>
          </div>

          {/* Right: live UI mockup */}
          <div style={{ flex: 1, minWidth: 0, animation: 'fadeSlideIn 0.6s ease 0.2s both' }} key={`ui-${active}`}>
            <div style={{
              background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
              borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)',
              padding: '20px', boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
              position: 'relative',
            }}>
              {/* Fake window chrome */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {['#ff5f57','#ffbd2e','#28c840'].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
                ))}
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 6, height: 10, marginLeft: 8 }} />
              </div>
              <img src={slide.image} alt={slide.title} style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: 12, display: "block" }} />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          position: 'relative', zIndex: 2,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', gap: 60, padding: '20px 40px', flexWrap: 'wrap',
        }}>
          {[['14+','Campus Spaces'],['4','Resource Types'],['100%','Online'],['24/7','Support']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em' }}>{v}</div>
              <div style={{ fontSize: 11, opacity: 0.55, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Features */}
      <section className="home-features">
        <h2>Everything your campus needs</h2>
        <p>Six core modules — one seamless experience.</p>
        <div className="home-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="home-card">
              <div className="home-card-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta" style={{ backgroundImage: "url(/hero_bg.png)", backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}><div style={{ position: "absolute", inset: 0, background: "rgba(10,15,30,0.85)", zIndex: 1 }}></div><div style={{ position: "relative", zIndex: 2 }}>
        <h2>Ready to get started?</h2>
        <p>Sign in with your Google account and take control of your campus operations in seconds.</p>
        <Link to="/login" className="btn-hero-primary" style={{ color: '#312e81' }}>
          Sign In with Google →
        </Link>
      </div></section>

      <footer className="home-footer">
        <p>
          <strong>SLIIT Smart Campus Operations Hub</strong>
          &ensp;·&ensp; IT3030 PAF Assignment 2026
          &ensp;·&ensp; Built with Spring Boot &amp; React
        </p>
      </footer>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .hero-split { flex-direction: column !important; }
        }
      `}</style>
    </div>
  )
}
