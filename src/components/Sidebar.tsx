'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Send, FileText, BarChart2, LogOut, Zap, BookOpen, Menu, X } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/campaigns', label: 'Campaigns', icon: Send },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/info', label: 'Info & Notes', icon: BookOpen },
]

function NavLinks({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem('kr_auth')
    router.push('/')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 10px' }}>
      {/* Logo */}
      <div style={{ padding: '4px 10px 20px', borderBottom: '1px solid var(--border)', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', background: 'var(--accent-glow)',
            border: '1px solid rgba(34,197,94,0.2)', borderRadius: '9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Zap size={16} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', lineHeight: 1.2 }}>
              Kaizen <span style={{ color: 'var(--accent)' }}>Reach</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>kaizenasc.com</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {links.map(({ href, label, icon: Icon }) => (
          
         <a   key={href}
            href={href}
            onClick={onNav}
            className={`sidebar-link ${pathname === href ? 'active' : ''}`}
          >
            <Icon size={15} />
            {label}
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
        <div style={{ padding: '6px 12px', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Logged in as</div>
          <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '500' }}>Sahil Sinha</div>
        </div>
        <button onClick={logout} className="sidebar-link">
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  if (isMobile) {
    return (
      <>
        {/* Mobile top bar */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          height: '56px',
          background: '#0a0d0b',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', background: 'var(--accent-glow)',
              border: '1px solid rgba(34,197,94,0.2)', borderRadius: '7px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={14} color="var(--accent)" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
              Kaizen <span style={{ color: 'var(--accent)' }}>Reach</span>
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '7px 8px', cursor: 'pointer',
              color: 'var(--text)', display: 'flex', alignItems: 'center',
            }}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Spacer so content doesn't hide under topbar */}
        <div style={{ height: '56px', flexShrink: 0 }} />

        {/* Drawer overlay */}
        {mobileOpen && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              display: 'flex',
            }}
          >
            {/* Backdrop */}
            <div
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(2px)',
              }}
            />

            {/* Drawer panel */}
            <div style={{
              position: 'relative', width: '240px', height: '100%',
              background: '#0a0d0b',
              borderRight: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
              animation: 'slideIn 0.2s ease',
            }}>
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  position: 'absolute', top: '14px', right: '14px',
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: '7px', padding: '5px', cursor: 'pointer',
                  color: 'var(--muted)', display: 'flex', alignItems: 'center',
                  zIndex: 1,
                }}
              >
                <X size={16} />
              </button>

              <NavLinks onNav={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <style>{`
          @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>
      </>
    )
  }

  // Desktop sidebar
  return (
    <aside style={{
      width: '210px',
      minHeight: '100vh',
      background: '#0a0d0b',
      borderRight: '1px solid var(--border)',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      <NavLinks />
    </aside>
  )
}