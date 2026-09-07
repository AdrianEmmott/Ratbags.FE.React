import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRightToBracket,
  faArrowRightFromBracket,
  faBars,
  faChevronDown,
  faMoon,
  faPlus,
  faSun,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import {
  faBluesky,
  faDiscord,
  faGithub,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import './Layout.css'

const NAV_LINKS = [
  { label: 'Home', to: '/#home' },
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/#pricing' },
  { label: 'About', to: '/#about' },
]

function Layout() {
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, logout, user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [publisherOpen, setPublisherOpen] = useState(false)
  const publisherRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    if (!publisherOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!publisherRef.current?.contains(event.target as Node)) {
        setPublisherOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPublisherOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [publisherOpen])

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand" to="/">
            <img src="/favicon.svg" alt="" width="28" height="28" />
            <span>Ratbags</span>
          </Link>

          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.to}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <NavLink
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Contact
            </NavLink>

            {isAuthenticated && (
              <div className="nav-dropdown" ref={publisherRef}>
                <button
                  type="button"
                  className={`nav-dropdown-trigger ${publisherOpen ? 'open' : ''}`}
                  onClick={() => setPublisherOpen((open) => !open)}
                  aria-haspopup="true"
                  aria-expanded={publisherOpen}
                >
                  Publisher
                  <FontAwesomeIcon icon={faChevronDown} />
                </button>
                <div className={`nav-dropdown-menu ${publisherOpen ? 'open' : ''}`}>
                  <Link
                    to="/articles/new"
                    onClick={() => {
                      setPublisherOpen(false)
                      setMenuOpen(false)
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add article
                  </Link>
                </div>
              </div>
            )}
          </nav>

          <div className="header-actions">
            {isAuthenticated ? (
                <button type="button" className="btn btn-secondary" onClick={handleLogout}>
                                  {user && (user.firstName || user.lastName) && (
                                      <span className="user-greeting">
                                          {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                                      </span>
                                  )}
                                  Log out
                  <FontAwesomeIcon icon={faArrowRightFromBracket} />
                </button>              
            ) : (
              <Link className="btn btn-secondary" to="/login">
                Log in
                <FontAwesomeIcon icon={faArrowRightToBracket} />
              </Link>
            )}
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
            </button>
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} Ratbags. All rights reserved.</p>
        <ul className="social-links">
          <li>
            <a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub">
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </li>
          <li>
            <a href="https://discord.com/" target="_blank" rel="noreferrer" aria-label="Discord">
              <FontAwesomeIcon icon={faDiscord} />
            </a>
          </li>
          <li>
            <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X">
              <FontAwesomeIcon icon={faXTwitter} />
            </a>
          </li>
          <li>
            <a href="https://bsky.app/" target="_blank" rel="noreferrer" aria-label="Bluesky">
              <FontAwesomeIcon icon={faBluesky} />
            </a>
          </li>
        </ul>
      </footer>
    </>
  )
}

export default Layout
