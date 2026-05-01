'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Users, Send, FileText, BarChart2, LogOut, Zap, BookOpen, Menu, X } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/campaigns', label: 'Campaigns', icon: Send },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/info', label: 'Info & Notes', icon: BookOpen },
]

function SidebarContent({ onNav }: { onNav?: () => void }) {
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

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {links.map(({ href, label, icon: Icon }) => (
          
          <a  key={href}
            href={href}
            className={`sidebar-link ${pathname === href ? 'active' : ''}`}
            onClick={onNav}
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

  return (
    <>
      {/* Mobile top bar */}
      <div style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--sidebar)', borderBottom: '1px solid var(--border)',
        padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between',
      }} className="mobile-menu-btn" id="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="var(--accent)" />
          <span style={{ fontSize: '14px', fontWeight: '700' }}>Kaizen <span style={{ color: 'var(--accent)' }}>Reach</span></span>
        </div>
        <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{
        width: '210px', minHeight: '100vh', background: 'var(--sidebar)',
        borderRight: '1px solid var(--border)', flexShrink: 0,
      }}>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
          <div style={{
            position: 'relative', width: '240px', background: 'var(--sidebar)',
            borderRight: '1px solid var(--border)', height: '100%',
          }}>
            <button onClick={() => setMobileOpen(false)} style={{
              position: 'absolute', top: 12, right: 12,
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
            }}>
              <X size={18} />
            </button>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}