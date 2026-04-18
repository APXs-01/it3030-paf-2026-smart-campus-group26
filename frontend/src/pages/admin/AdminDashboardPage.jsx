// Admin Dashboard — Usage Analytics
import { useEffect, useState } from 'react'
import { getAnalytics } from '../../api/bookings'

/* Load SheetJS from CDN on demand — avoids Vite bundling issues */
function loadXLSX() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) { resolve(window.XLSX); return }
    const existing = document.querySelector('script[data-xlsx]')
    if (existing) { existing.addEventListener('load', () => resolve(window.XLSX)); return }
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
    s.setAttribute('data-xlsx', '1')
    s.onload = () => resolve(window.XLSX)
    s.onerror = () => reject(new Error('Failed to load Excel library'))
    document.head.appendChild(s)
  })
}

async function downloadExcel(data) {
  const XLSX = await loadXLSX()

  const wb = XLSX.utils.book_new()
  const date = new Date().toLocaleDateString('en-GB')

  /* ── Sheet 1: Summary ── */
  const summaryRows = [
    ['Smart Campus — Analytics Report'],
    ['Generated', date],
    [],
    ['Metric', 'Value'],
    ['Total Bookings', data.totalBookings],
    ['Approved',       data.approved],
    ['Pending',        data.pending],
    ['Rejected',       data.rejected],
    ['Cancelled',      data.cancelled],
    ['Checked In',     data.checkedIn],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(summaryRows)
  ws1['!cols'] = [{ wch: 22 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Summary')

  /* ── Sheet 2: Top Resources ── */
  const resourceRows = [
    ['Resource', 'Location', 'Total Bookings'],
    ...data.topResources.map(r => [r.resourceName, r.location, r.count])
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(resourceRows)
  ws2['!cols'] = [{ wch: 20 }, { wch: 16 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Top Resources')

  /* ── Sheet 3: Peak Hours ── */
  const hourRows = [
    ['Hour', 'Bookings'],
    ...data.peakHours.map(h => [h.label, h.count])
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(hourRows)
  ws3['!cols'] = [{ wch: 10 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'Peak Hours')

  /* ── Sheet 4: Last 7 Days ── */
  const dayRows = [
    ['Date', 'Bookings'],
    ...data.last7Days.map(d => [d.date, d.count])
  ]
  const ws4 = XLSX.utils.aoa_to_sheet(dayRows)
  ws4['!cols'] = [{ wch: 16 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws4, 'Last 7 Days')

  XLSX.writeFile(wb, `analytics-report-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

/* ── Stat card ── */
function StatCard({ label, value, color, sub }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -40, width: 80, height: 80, background: color, filter: 'blur(30px)', opacity: 0.2 }} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-light)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}

/* ── Horizontal bar chart ── */
function HBar({ label, count, max, color = 'var(--primary)' }) {
  const pct = max > 0 ? (count / max) * 100 : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{count}</span>
      </div>
      <div style={{ background: 'var(--border)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 6,
          background: color, transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

/* ── Vertical bar chart (peak hours) ── */
function VBarChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 6,
      height: 120, paddingBottom: 24, position: 'relative',
      overflowX: 'auto',
    }}>
      {data.map(d => (
        <div key={d.hour} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>
            {d.count > 0 ? d.count : ''}
          </div>
          <div style={{
            width: 28,
            height: `${Math.max((d.count / max) * 90, d.count > 0 ? 6 : 0)}px`,
            background: d.count === Math.max(...data.map(x => x.count))
              ? 'var(--primary)' : 'var(--primary-light)',
            borderRadius: '4px 4px 0 0',
            border: '1px solid var(--primary)',
            transition: 'height 0.5s ease',
          }} />
          <div style={{
            fontSize: 9, color: 'var(--text-muted)', marginTop: 4,
            transform: 'rotate(-45deg)', whiteSpace: 'nowrap',
          }}>
            {d.label}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── 7-day trend bars ── */
function TrendChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, paddingBottom: 28 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>
            {d.count > 0 ? d.count : ''}
          </div>
          <div style={{
            width: '100%',
            height: `${Math.max((d.count / max) * 72, d.count > 0 ? 4 : 2)}px`,
            background: d.count > 0 ? 'var(--primary)' : 'var(--border)',
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.5s ease',
          }} />
          <div style={{
            fontSize: 9, color: 'var(--text-muted)', marginTop: 4,
            textAlign: 'center', whiteSpace: 'nowrap',
          }}>
            {d.date.split(' ')[0]}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalytics()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (error) return <div className="alert alert-danger">{error}</div>

  const topMax = data.topResources.length > 0 ? data.topResources[0].count : 1

  return (
    <div>
      <div className="page-hero-banner" style={{ backgroundImage: 'url(/hero_bg.png)' }}>
        <div className="page-hero-content">
          <h1>System Analytics</h1>
          <p>Global oversight of platform utilization, bookings, and facility traffic.</p>
          <div>
            <button
              onClick={() => downloadExcel(data)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, marginTop: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)' }}
            >
              ⬇ Export Analytics Report
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 14, marginBottom: 24,
      }}>
        <StatCard label="Total Bookings" value={data.totalBookings} color="var(--text)" />
        <StatCard label="Approved" value={data.approved} color="#10b981" />
        <StatCard label="Pending" value={data.pending} color="#f59e0b" />
        <StatCard label="Rejected" value={data.rejected} color="#ef4444" />
        <StatCard label="Cancelled" value={data.cancelled} color="#94a3b8" />
        <StatCard label="Checked In" value={data.checkedIn} color="var(--primary)"
          sub={`${data.approved > 0 ? Math.round((data.checkedIn / data.approved) * 100) : 0}% of approved`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>

        {/* ── Top Resources ── */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Top Resources</h3>
          {data.topResources.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No bookings yet.</p>
          ) : (
            data.topResources.map((r, i) => (
              <HBar
                key={r.resourceId}
                label={`${r.resourceName} (${r.location})`}
                count={r.count}
                max={topMax}
                color={i === 0 ? 'var(--primary)' : `hsl(${220 + i * 15}, 70%, ${55 + i * 5}%)`}
              />
            ))
          )}
        </div>

        {/* ── 7-day trend ── */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Bookings — Last 7 Days</h3>
          {data.last7Days.every(d => d.count === 0) ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No bookings in the last 7 days.</p>
          ) : (
            <TrendChart data={data.last7Days} />
          )}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Total this week: <strong>{data.last7Days.reduce((s, d) => s + d.count, 0)}</strong>
          </div>
        </div>
      </div>

      {/* ── Peak Hours ── */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Peak Booking Hours</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Based on booking start time — the tallest bar is the busiest hour.
        </p>
        {data.peakHours.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet.</p>
        ) : (
          <VBarChart data={data.peakHours} />
        )}
        {data.peakHours.length > 0 && (() => {
          const peak = data.peakHours.reduce((a, b) => a.count >= b.count ? a : b)
          return (
            <div style={{
              marginTop: 8, fontSize: 12, color: 'var(--text-muted)',
              background: 'var(--primary-light)', padding: '8px 12px', borderRadius: 8,
            }}>
              Busiest hour: <strong style={{ color: 'var(--primary)' }}>{peak.label}</strong>
              {' '}with <strong>{peak.count}</strong> booking{peak.count !== 1 ? 's' : ''}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
