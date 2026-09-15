import React from 'react';
import { Home, Users, Receipt, Activity, Settings, CreditCard, LogOut } from 'lucide-react';
import avatarImg from '../assets/avatar.jpg';

export default function Sidebar({ activeNav = 'Overview', onNavSelect, userName = 'Sohan', onLogout }) {
  const navItems = [
    { name: 'Overview', icon: Home },
    { name: 'Groups', icon: Users },
    { name: 'Expenses', icon: Receipt },
    { name: 'Activity', icon: Activity },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brandContainer}>
        <div style={styles.logoBadge}>
          <CreditCard size={20} color="#FFFFFF" strokeWidth={2.2} />
        </div>
        <div style={styles.brandText}>
          <div style={styles.brandTitle}>Splitly</div>
          <div style={styles.brandSubtitle}>Expense Manager</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={styles.navMenu}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeNav === item.name;

          return (
            <button
              key={item.name}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : styles.navItemInactive),
              }}
              onClick={() => onNavSelect && onNavSelect(item.name)}
            >
              <IconComponent
                size={18}
                color={isActive ? '#FFFFFF' : '#8E9CAE'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span
                style={{
                  ...styles.navLabel,
                  color: isActive ? '#FFFFFF' : '#8E9CAE',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Card at Bottom */}
      <div style={styles.profileSection}>
        <div style={styles.profileCard}>
          <img
            src={avatarImg}
            alt={userName}
            style={styles.avatar}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={styles.avatarFallback}>{userName?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>{userName}</div>
            <div style={styles.profileBadge}>Pro Member</div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Log out"
              style={styles.logoutBtn}
            >
              <LogOut size={16} color="#94A3B8" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    minWidth: '240px',
    backgroundColor: '#0A0D18',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px 20px 16px',
    height: '100vh',
    position: 'sticky',
    top: 0,
    boxSizing: 'border-box',
    userSelect: 'none',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '4px 8px 32px 8px',
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '11px',
    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.45)',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: '700',
    letterSpacing: '-0.2px',
    lineHeight: 1.2,
  },
  brandSubtitle: {
    color: '#717D96',
    fontSize: '11.5px',
    fontWeight: '500',
    marginTop: '2px',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '11px 16px',
    borderRadius: '12px',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    width: '100%',
    cursor: 'pointer',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
    border: '1px solid rgba(168, 85, 247, 0.55)',
    boxShadow: '0 0 20px rgba(168, 85, 247, 0.28), inset 0 0 10px rgba(168, 85, 247, 0.1)',
  },
  navItemInactive: {
    background: 'transparent',
    border: '1px solid transparent',
  },
  navLabel: {
    fontSize: '14px',
    letterSpacing: '0.1px',
  },
  profileSection: {
    marginTop: 'auto',
    paddingTop: '16px',
  },
  profileCard: {
    backgroundColor: '#12172A',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '13px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  avatarFallback: {
    display: 'none',
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    fontWeight: '700',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: '13.5px',
    fontWeight: '600',
    lineHeight: 1.2,
  },
  profileBadge: {
    color: '#717D96',
    fontSize: '11.5px',
    marginTop: '2px',
  },
  logoutBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
};
