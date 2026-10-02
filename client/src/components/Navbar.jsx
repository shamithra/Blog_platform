import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  Search, 
  PenSquare, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ 
  theme, 
  toggleTheme, 
  onOpenAuth, 
  onOpenCreatePost, 
  searchQuery, 
  setSearchQuery,
  onResetFilters 
}) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.85rem 0'
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={onResetFilters} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            cursor: 'pointer' 
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--accent-glow)'
          }}>
            <Zap size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{ 
              fontWeight: 800, 
              fontSize: '1.25rem', 
              letterSpacing: '-0.03em',
              display: 'block',
              lineHeight: 1
            }}>
              Nimbus<span className="gradient-text">Log</span>
            </span>
            <span style={{ 
              fontSize: '0.7rem', 
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Tech & Design Insights
            </span>
          </div>
        </div>

        {/* Live Search Bar */}
        <div style={{
          position: 'relative',
          flex: 1,
          maxWidth: '420px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search articles, tags, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{
              paddingLeft: '2.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-secondary)',
              fontSize: '0.88rem'
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-tertiary)',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Write Post Button */}
          {user ? (
            <button 
              onClick={onOpenCreatePost}
              className="btn btn-primary"
              style={{ gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.88rem' }}
            >
              <PenSquare size={16} />
              <span>Write Post</span>
            </button>
          ) : (
            <button 
              onClick={() => onOpenAuth('login')}
              className="btn btn-secondary"
              style={{ gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.88rem' }}
            >
              <Sparkles size={16} color="var(--accent-primary)" />
              <span>Write Article</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {/* User Auth Section */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.6rem 0.35rem 0.35rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.username}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {/* User Dropdown Menu */}
              {dropdownOpen && (
                <div 
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '220px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.6rem',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1100
                  }}
                >
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: '0.4rem'
                  }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.username}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => onOpenAuth('login')}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="btn btn-primary"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
